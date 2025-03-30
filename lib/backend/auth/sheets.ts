import { UserSession, USER_DATA, UserInfo, UserColumns, UserToken, UserId, TOKEN_DATA, UserIdentifiers } from "@/lib/types/userTypes";
import { GoogleAuth } from "google-auth-library";
import { GoogleSpreadsheet, GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import { checkPasswordAgainstSaltAndHash, generateSaltAndHash, generateToken, isExpired } from "./crypto";
import { FlatTwoDimentionalArray, RequireOneExactly } from "@/lib/types/utilTypes";

const USER_SHEET = 'users';
const TOKEN_SHEET = 'tokens';

// ======== Sheets Helper Functions ========

/** Logs into and accesses the google spreadsheet. */
async function getGoogleSpreadsheet(): Promise<GoogleSpreadsheet> {
	const auth = new GoogleAuth({
		scopes: [
			'https://www.googleapis.com/auth/spreadsheets',
			// 'https://www.googleapis.com/auth/drive.file' // To create/delete files
		]
	});
	const spreadsheetId = process.env.GOOGLE_SHEET_ID;
	if (typeof spreadsheetId !== 'string') {
		throw new Error('No Sheet ID in Environment');
	} else {
		// console.log('Sheet ID:', spreadsheetId);
	}
	// console.log('Project ID:', await auth.getProjectId());
	// console.log('Credentials:', await auth.getCredentials());
	const doc = new GoogleSpreadsheet(spreadsheetId, auth);


	try {
		await doc.loadInfo(); // loads document properties and worksheets
		return doc;
	} catch (e: any) {
		throw new Error('Could not get Google Sheet Document: ' + e?.message);
	}
}

/** Gets (or creates if not existing) a sheet in a given document. Will automatically create the google doc if not already. */
async function getSheet(title: string, doc?: GoogleSpreadsheet): Promise<[GoogleSpreadsheetWorksheet, boolean]> {
	const document = doc ?? await getGoogleSpreadsheet();
	return document.sheetsByTitle[title] ?
		[document.sheetsByTitle[title], true] :
		[await document.addSheet({ title }), false];
}

/** Gets (or creates if not existing) the user sheet in a given document. */
async function getUserSheet(doc?: GoogleSpreadsheet): Promise<GoogleSpreadsheetWorksheet> {
	const [sheet, old] = await getSheet(USER_SHEET, doc);
	if (!old) {
		// Initialize Sheet data
		sheet.setHeaderRow(USER_DATA);
	}
	return sheet;
}

/** Gets the row for a given user using a unique identifier */
async function getUserRow(searchProp: RequireOneExactly<UserIdentifiers>, userSheet?: GoogleSpreadsheetWorksheet): Promise<GoogleSpreadsheetRow<UserColumns> | null> {
	const sheet = userSheet ?? await getUserSheet();
	if (sheet.rowCount < 2) { return null; } // User Sheet is Empty

	const column = searchProp.userId ? 'A' : 'B';
	const addresses = `${column}2:${column}${sheet.rowCount}`;

	await sheet.loadCells(addresses);
	const userProps = (await sheet.getCellsInRange(addresses, { majorDimension: "COLUMNS" }))[0];

	const givenProp = searchProp.userId ?? searchProp.userName;
	const userIndex = userProps.findIndex((checkProp: string | number) => checkProp === givenProp);

	if (userIndex === -1) { return null; } // User not Found

	return (await sheet.getRows({ offset: userIndex, limit: 1 }))[0];
}

/** Gets (or creates if not existing) the token sheet in a given document. */
async function getTokenSheet(doc?: GoogleSpreadsheet): Promise<GoogleSpreadsheetWorksheet> {
	const [sheet, old] = await getSheet(TOKEN_SHEET, doc);
	if (!old) {
		// Initialize Sheet data
		sheet.setHeaderRow(TOKEN_DATA);
	}
	return sheet;
}

// ======== Auth ========


/** Does password checking for the given account. If valid, returns the Row for processing. */
async function verifyUserAccount(userName: string, password: string): Promise<GoogleSpreadsheetRow | null> {
	const userRow = await getUserRow({ userName });
	if (!userRow) { return null; } // No User

	if (!await checkPasswordAgainstSaltAndHash(password, userRow.get('salt'), userRow.get('hash'))) {
		return null; // Wrong Password
	}

	return userRow;
}

// ======== Auth Tokens ========

/**
 * Returns an auth token for the given user(Row).
 * Deletes the entire row for all expired or invalid Tokens.
 * Must Process backwards (bottom-up) to prevent row deletions from fucking indices up.
 */
async function getTokenRow(userId: UserId, doc?: GoogleSpreadsheet): Promise<[GoogleSpreadsheetRow<UserSession>, () => Promise<void>] | null> {
	const tokenSheet = await getTokenSheet(doc);
	const tokenRows: GoogleSpreadsheetRow<UserSession>[] = await tokenSheet.getRows();

	let found = false;
	for (let i = tokenRows.length -1; i >= 0; i--) { // iterate through rows backwards
		const tokenRow = tokenRows[i];
		const data = tokenRow.toObject();
		if (
			!data.userId || !data.token || !data.tokenCreated || // Invalid Token
			isExpired(data.tokenCreated) || // ExpiredToken
			(data.userId === userId && found) // Duplicate ID
		) {
			await tokenRow.delete();
		} else if (data.userId !== userId) { // Valid but Different ID
			continue;
		} else { // Valid ID
			return [
				tokenRows[i],
				() => cleanupTokens(tokenSheet, i - 1)
			];
		}
	}

	return null; // Not Found
}

/** Run by getTokenRow to continue the row cleanup after whatever is done with the searched row */
async function cleanupTokens(tokenSheet: GoogleSpreadsheetWorksheet, lastIndex?: number) {
	const tokenRows: GoogleSpreadsheetRow<UserSession>[] = await tokenSheet.getRows({ limit: lastIndex });

	for (let i = tokenRows.length -1; i >= 0; i--) { // iterate through rows backwards
		const tokenRow = tokenRows[i];
		const data = tokenRow.toObject();
		if (
			!data.userId || !data.token || !data.tokenCreated || // Invalid Token
			isExpired(data.tokenCreated) // ExpiredToken
		) {
			await tokenRow.delete();
		}
	}
}

/** Generates, saves, and returns an auth token for the given user(Row). */
async function assignToken(userId: UserId, doc?: GoogleSpreadsheet): Promise<UserToken> {
	const userToken = generateToken();

	const out = await getTokenRow(userId);
	if (out) {
		const [tokenRow, cleanup] = out;
		tokenRow.assign({
			userId,
			...userToken
		});
		await tokenRow.save();
		await cleanup();
	} else {
		const tokenSheet = await getTokenSheet(doc);
		await tokenSheet.addRow({
			userId,
			...userToken
		});
	}
	return userToken;
}

// TODO: Token refresh. Requires some system that would be best done automatically by a library


// ======== User Actions ========

/**
 * Creates a user account.
 * UserId generation assumes that they're in ascending order.
 */
export async function createUserAccount(userName: string, password: string): Promise<boolean> {
	const userSheet = await getUserSheet();

	const userNameAddresses = `B2:B${userSheet.rowCount}`;
	await userSheet.loadCells(userNameAddresses);
	const userNames = (await userSheet.getCellsInRange(userNameAddresses, { majorDimension: "COLUMNS" }) as FlatTwoDimentionalArray<string>)[0];

	if (userNames.find((checkUserName) => checkUserName === userName.toString())) { // Username already taken.
		return false;
	}

	const lastIdAddress = `A${userSheet.rowCount}`;
	await userSheet.loadCells(lastIdAddress);
	const lastId = userSheet.getCellByA1(lastIdAddress).value as number;

	const { salt, hash } = generateSaltAndHash(password);

	userSheet.addRow({
		userId: lastId + 1,
		userName,
		salt,
		hash
	});

	return true;
}

/**
 * "Deletes" the user Account by making it impossible to log in.
 */
export async function deleteUserAccountQuickly(userName: string, password: string): Promise<boolean> {
	const userRow = await verifyUserAccount(userName, password);
	if (!userRow) { return false; } // Failed Login

	userRow.set('hash', null);
	await userRow.save();

	return true;
}

/**
 * "Deletes" the user Account by making it impossible to log in and removing all data aside from userId.
 * The userId is kept to maintain that ID.
 */
export async function deleteUserAccount(userName: string, password: string): Promise<boolean> {
	const userRow = await verifyUserAccount(userName, password);
	if (!userRow) { return false; } // Failed Login

	userRow.assign({
		userName: null,
		hash: null,
		salt: null,
		token: null,
		tokenCreated: null,
		touches: null,
		data: null
	});
	await userRow.save();

	return true;
}

/**
 * Logs the user in.
 * Verifies username and password. Creates a new auth token. Returns that token and the user's ID.
 */
export async function loginUser(userName: string, password: string): Promise<UserSession | null> {
	const userRow = await verifyUserAccount(userName, password);
	if (!userRow) { return null; } // Failed Login

	const userId = userRow.get('userId');

	return {
		userId,
		...(await assignToken(userId))
	};
}

/**
 * Gets the user's data by userId
 */
export async function getUserData(userId: number): Promise<UserInfo | null> {
	const userRow = await getUserRow({ userId });
	if (!userRow) { return null; }

	return {
		userId,
		userName: userRow.get('userName'),
		touches: userRow.get('touches'),
		data: userRow.get('data')
	};
}

/**
 * Modifies some values for a given user
 */
export async function setUserData(userId: number, userData: Partial<UserColumns>) {
	const userRow = await getUserRow({ userId });
	if (!userRow) { return false; }

	userRow.assign(userData);
	await userRow.save();

	return true;
}
