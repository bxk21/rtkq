import { UserSession, USER_DATA, UserInfo, UserColumns, UserToken, UserId, TOKEN_DATA, UserIdentifiers, METADATA_DATA, MetadataKey, Metadata, METEDATA_INDEX_A1, METADATA_SHEET, TOKEN_SHEET, USER_SHEET } from "@/lib/types/userTypes";
import { GoogleAuth } from "google-auth-library";
import { GoogleSpreadsheet, GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import { checkPasswordAgainstSaltAndHash, generateSaltAndHash, generateToken, isExpired } from "./crypto";
import { FlatTwoDimentionalArray, RequireOneExactly } from "@/lib/types/utilTypes";
import { HttpStatusCode } from "axios";

// const LOCK_SHEET = 'lock';

export class Sheet {
	private sheet: GoogleSpreadsheet | undefined;
	private userWorksheet: GoogleSpreadsheetWorksheet | undefined;
	private tokenWorksheet: GoogleSpreadsheetWorksheet | undefined;
	private metadataWorksheet: GoogleSpreadsheetWorksheet | undefined;

	constructor() { return this; }

	// ======== Sheets Helper Functions ========

	/** Logs into and accesses the google spreadsheet. */
	private async getGoogleSpreadsheet(): Promise<GoogleSpreadsheet> {
		if (this.sheet) { return this.sheet; }

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
			this.sheet = doc;
			return doc;
		} catch (e: any) {
			throw new Error('Could not get Google Sheet Document: ' + e?.message);
		}
	}

	/** Gets (or creates if not existing) a sheet in a given document. Will automatically create the google doc if not already. */
	private async getSheet(title: string): Promise<[GoogleSpreadsheetWorksheet, boolean]> {
		const document = await this.getGoogleSpreadsheet();
		return document.sheetsByTitle[title] ?
			[document.sheetsByTitle[title], true] :
			[await document.addSheet({ title }), false];
	}

	// ======== Users ========

	/** Gets (or creates if not existing) the user sheet in a given document. */
	private async getUserSheet(): Promise<GoogleSpreadsheetWorksheet> {
		if (this.userWorksheet) { return this.userWorksheet; }

		const [sheet, old] = await this.getSheet(USER_SHEET);
		if (!old) {
			// Initialize Sheet data
			sheet.setHeaderRow(USER_DATA);
		}

		this.userWorksheet = sheet;

		return sheet;
	}

	/** Gets the row for a given user using a unique identifier */
	private async getUserRow(searchProp: RequireOneExactly<UserIdentifiers>): Promise<GoogleSpreadsheetRow<UserColumns> | null> {
		const sheet = await this.getUserSheet();
		const lastUserIndex = (await this.getMetaData('lastUserIndex')).get('value');
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

	// ======== Metadata ========

	/** Gets (or creates if not existing) the metadata sheet in a given document. */
	private async getMetaDataSheet(): Promise<GoogleSpreadsheetWorksheet> {
		if (this.metadataWorksheet) { return this.metadataWorksheet; }

		const [sheet, old] = await this.getSheet(METADATA_SHEET);
		if (!old) {
			// Initialize Sheet data
			await sheet.setHeaderRow(METADATA_DATA);
			await sheet.addRows([
				['lastMetadataIndex', 3],
				['lastUserIndex', 0],
				['lastTokenIndex', 0]
			]);
		}

		this.metadataWorksheet = sheet;

		return sheet;
	}

	/** Gets a piece of metadata by the key and its address in a tuple. */
	private async getMetaData(key: MetadataKey): Promise<GoogleSpreadsheetRow<Metadata>> {
		const metadataWorksheet = await this.getMetaDataSheet();
		await metadataWorksheet.loadCells(METEDATA_INDEX_A1);
		const metadataSizeCell = metadataWorksheet.getCellByA1(METEDATA_INDEX_A1);
		if (!metadataSizeCell.numberValue) {
			// metadataSizeCell.numberValue = METADATA_COLUMNS.length;
			// metadataSizeCell.save();
			throw new Error('lastMetadataIndex not found');
		}
		const rows: GoogleSpreadsheetRow<Metadata>[] = await metadataWorksheet.getRows({ limit: metadataSizeCell.numberValue + 1 });
		let dataRow = rows.find((row) => row.get("key") === key);
		if (!dataRow) {
			dataRow = await metadataWorksheet.addRow({ key, value: '' });
			metadataSizeCell.numberValue += 1;
			await metadataSizeCell.save();
		}
		return dataRow;
	}

	private async setMetaData(key: MetadataKey, value: string | number): Promise<void> {
		const dataRow = await this.getMetaData(key);
		dataRow.set('value', value);
		await dataRow.save();
	}

	// ======== Auth ========

	/** Does password checking for the given account. If valid, returns the Row for processing. */
	private async verifyUserAccount(userName: string, password: string): Promise<GoogleSpreadsheetRow<UserColumns> | null> {
		console.log('getting user', userName);
		const userRow = await this.getUserRow({ userName });
		if (!userRow) { return null; } // No User

		console.log('Logging in:', userName, userRow.toObject());

		if (!await checkPasswordAgainstSaltAndHash(password, userRow.get('salt'), userRow.get('hash'))) {
			return null; // Wrong Password
		}

		return userRow;
	}

	// ======== Auth Tokens ========

	/** Gets (or creates if not existing) the token sheet in a given document. */
	private async getTokenSheet(): Promise<GoogleSpreadsheetWorksheet> {
		if (this.tokenWorksheet) { return this.tokenWorksheet; }

		const [sheet, old] = await this.getSheet(TOKEN_SHEET);
		if (!old) {
			// Initialize Sheet data
			sheet.setHeaderRow(TOKEN_DATA);
		}

		this.tokenWorksheet = sheet;

		return sheet;
	}

	/**
	 * Returns an auth token for the given user(Row).
	 * Deletes the entire row for all expired or invalid Tokens.
	 * Must Process backwards (bottom-up) to prevent row deletions from moving indices around.
	 */
	private async getTokenRow(userId: UserId): Promise<[GoogleSpreadsheetRow<UserSession>, () => Promise<void>] | null> {
		const tokenSheet = await this.getTokenSheet();
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
					() => this.cleanupTokens(tokenSheet, i - 1)
				];
			}
		}

		return null; // Not Found
	}

	/** Run by getTokenRow to continue the row cleanup after whatever is done with the searched row */
	private async cleanupTokens(tokenSheet: GoogleSpreadsheetWorksheet, lastIndex?: number): Promise<void> {
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
	private async assignToken(userId: UserId): Promise<UserToken> {
		const userToken = generateToken();

		console.log('GENERATING TOKEN');

		const out = await this.getTokenRow(userId);
		console.log('DONE GENERATING TOKEN', out?.[0]);
		if (out) { // Update Existing Token
			const [tokenRow, cleanup] = out;
			tokenRow.assign({
				userId,
				...userToken
			});
			await tokenRow.save();
			await cleanup();
		} else { // Create New Token
			const tokenSheet = await this.getTokenSheet();
			const tokenRow = await tokenSheet.addRow({
				userId,
				...userToken
			});
			console.log('token:', tokenRow.toObject());
		}
		return userToken;
	}

	// TODO: Token refresh.

	// ======== Public Actions ========

	/**
	 * Creates a user account.
	 * UserId generation assumes that they're in ascending order.
	 * Loads only the userNames to check for collisions, instead of loading all Rows.
	 */
	public async createUserAccount(userName: string, password: string): Promise<ResponseInit | false> {
		if (userName.length < 1) {
			return {
				status: HttpStatusCode.UnprocessableEntity,
				statusText: 'Username is Too Short'
			};
		}

		const userSheet = await this.getUserSheet();
		const lastUserIndex = Number.parseInt((await this.getMetaData('lastUserIndex')).get('value'));
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

		await this.setMetaData('lastUserIndex', lastUserIndex + 1);

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
	public async deleteUserAccountQuickly(userName: string, password: string): Promise<boolean> {
		const userRow = await this.verifyUserAccount(userName, password);
		if (!userRow) { return false; } // Failed Login

		userRow.set('hash', '');
		await userRow.save();

		return true;
	}

	/**
	 * "Deletes" the user Account by making it impossible to log in and removing all data aside from userId.
	 * The userId is kept to maintain that ID.
	 */
	public async deleteUserAccount(userName: string, password: string): Promise<boolean> {
		const userRow = await this.verifyUserAccount(userName, password);
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
	public async loginUser(userName: string, password: string): Promise<UserSession | null> {
		const userRow = await this.verifyUserAccount(userName, password);
		if (!userRow) { return null; } // Failed Login

		console.log('logged in', userRow.toObject());

		const userId = userRow.get('userId');

		return {
			userId,
			...(await this.assignToken(userId))
		};
	}

	/**
	 * Gets the user's data by userId
	 */
	public async getUserData(userId: number): Promise<UserInfo | null> {
		const userRow = await this.getUserRow({ userId });
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
	public async setUserData(userId: number, userData: Partial<UserColumns>): Promise<boolean> {
		const userRow = await this.getUserRow({ userId });
		if (!userRow) { return false; }

		userRow.assign(userData);
		await userRow.save();

		return true;
	}

}
