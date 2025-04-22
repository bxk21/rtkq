import { UserSession, USER_DATA, UserInfo, UserColumns, UserIdentifiers, USER_SHEET } from "@/src/lib/types/userTypes";
import { GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import { getSheet } from "./sheets";
import { FlatTwoDimentionalArray, RequireOneExactly } from "../../types/utilTypes";
import { getMetaData, setMetaData } from "./metadata";
import { checkPasswordAgainstSaltAndHash, generateSaltAndHash } from "./crypto";
import { HttpStatusCode } from "axios";
import { assignToken } from "./token";

let userWorksheet: GoogleSpreadsheetWorksheet | undefined;

// ======== Users ========

/** Gets (or creates if not existing) the user sheet in a given document. */
async function getUserSheet(): Promise<GoogleSpreadsheetWorksheet> {
	if (userWorksheet) { return userWorksheet; }

	const [sheet, old] = await getSheet(USER_SHEET);
	if (!old) {
		// Initialize Sheet data
		sheet.setHeaderRow(USER_DATA);
	}

	userWorksheet = sheet;

	return sheet;
}

/** Gets the row for a given user using a unique identifier */
async function getUserRow(searchProp: RequireOneExactly<UserIdentifiers>): Promise<GoogleSpreadsheetRow<UserColumns> | null> {
	const sheet = await getUserSheet();
	const lastUserIndex = (await getMetaData('lastUserIndex')).get('value');
	if (lastUserIndex < 1) { return null; } // User Sheet is Empty

	const column = searchProp.userId ? 'A' : 'B';
	const addresses = `${column}2:${column}${lastUserIndex + 1}`;

	await sheet.loadCells(addresses);
	const userProps = (await sheet.getCellsInRange(addresses, { majorDimension: "COLUMNS" }) as FlatTwoDimentionalArray<string> ?? [])[0];
	console.log('userprops', userProps);
	const givenProp = searchProp.userId ?? searchProp.userName;
	const userIndex = userProps?.findIndex((checkProp: string) => checkProp === givenProp);
	console.log('userIndex', userIndex)

	if (userIndex === -1) { return null; } // User not Found

	return (await sheet.getRows({ offset: userIndex, limit: 1 }))[0];
}

// ======== Password ========

/** Does password checking for the given account. If valid, returns the Row for processing. */
async function verifyUserAccount(userName: string, password: string): Promise<GoogleSpreadsheetRow<UserColumns> | null> {
	console.log('getting user', userName);
	const userRow = await getUserRow({ userName });
	if (!userRow) { return null; } // No User

	console.log('Logging in:', userName, userRow.toObject());

	if (!await checkPasswordAgainstSaltAndHash(password, userRow.get('salt'), userRow.get('hash'))) {
		return null; // Wrong Password
	}

	return userRow;
}

// ======== Public Actions ========

/**
 * Creates a user account.
 * UserId generation assumes that they're in ascending order.
 * Loads only the userNames to check for collisions, instead of loading all Rows.
 */
export async function createUserAccount(userName: string, password: string): Promise<ResponseInit | false> {
	if (userName.length < 1) {
		return {
			status: HttpStatusCode.UnprocessableEntity,
			statusText: 'Username is Too Short'
		};
	}

	const userSheet = await getUserSheet();
	const lastUserIndex = Number.parseInt((await getMetaData('lastUserIndex')).get('value'));
	// console.log('Number of User Rows: ', lastUserIndex);

	const userNameAddresses = `B2:B${lastUserIndex + 1}`;
	await userSheet.loadCells(userNameAddresses);
	const userNames = (await userSheet.getCellsInRange(userNameAddresses, { majorDimension: "COLUMNS" }) as FlatTwoDimentionalArray<string> ?? [])[0];

	if (userNames?.find((checkUserName) => checkUserName === userName.toString())) {
		return {
			status: HttpStatusCode.Conflict,
			statusText: 'Username is Already Taken'
		};
	}

	// Get Previous User's ID

	const lastIdAddress = `A${lastUserIndex + 1}`;
	await userSheet.loadCells(lastIdAddress);
	const lastId = userSheet.getCellByA1(lastIdAddress).numberValue ?? 0;
	// console.log('last user', userSheet.getCellByA1(lastIdAddress).value);

	// Create new User

	const { salt, hash } = generateSaltAndHash(password);

	await setMetaData('lastUserIndex', lastUserIndex + 1);

	userSheet.addRow({
		userId: lastId + 1,
		userName,
		salt,
		hash
	});

	return false;
}

/**
 * "Deletes" the user Account by making it impossible to log in.
 */
export async function deleteUserAccountQuickly(userName: string, password: string): Promise<boolean> {
	const userRow = await verifyUserAccount(userName, password);
	if (!userRow) { return false; } // Failed Login

	userRow.set('hash', '');
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
		userName: undefined,
		hash: undefined,
		salt: undefined,
		token: undefined,
		tokenCreated: undefined,
		touches: undefined,
		data: undefined
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

	console.log('logged in', userRow.toObject());

	const userId = userRow.get('userId');

	return {
		userId,
		...(await assignToken(userId))!
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
export async function setUserData(userId: number, userData: Partial<UserColumns>): Promise<boolean> {
	const userRow = await getUserRow({ userId });
	if (!userRow) { return false; }

	userRow.assign(userData);
	await userRow.save();

	return true;
}
