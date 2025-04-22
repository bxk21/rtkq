import { UserSession, UserId, TOKEN_COLUMNS, TOKEN_SHEET } from "@/src/lib/types/userTypes";
import { GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import { toInt } from "../../util/string";
import { getSheet } from "./sheets";
import { generateToken, isExpired } from "./crypto";
import { setMetaData } from "./metadata";

let tokenWorksheet: GoogleSpreadsheetWorksheet | undefined;

// FIXME: The Token Page currently doesn't need to use `lastTokenIndex` at all. Remove?
async function incrementMetadata(amount: number = 1) {
	// await setMetaData('lastTokenIndex', (dataRow) => Number.parseInt(dataRow.get('value')) + amount);
}

/** Gets (or creates if not existing) the token sheet in a given document. */
async function getTokenSheet(): Promise<GoogleSpreadsheetWorksheet> {
	if (tokenWorksheet) { return tokenWorksheet; }

	const [sheet, old] = await getSheet(TOKEN_SHEET);
	if (!old) {
		// Initialize Sheet data
		sheet.setHeaderRow(TOKEN_COLUMNS);
	}

	tokenWorksheet = sheet;

	return sheet;
}

/**
 * Returns an auth token for the given user(Row).
 * Deletes the entire row for all expired or invalid Tokens.
 * Must Process backwards (bottom-up) to prevent row deletions from moving indices around.
 */
async function getTokenRow(userId: UserId): Promise<[GoogleSpreadsheetRow<Partial<UserSession>>, (() => Promise<void>) | null] | null> {
	const tokenSheet = await getTokenSheet();
	const tokenRows: GoogleSpreadsheetRow<Partial<UserSession>>[] = await tokenSheet.getRows();

	let found = false;
	let deleteCount = 0;
	for (let i = tokenRows.length -1; i >= 0; i--) { // iterate through rows backwards
		const tokenRow = tokenRows[i];
		const tokenUserId = Number.parseInt(tokenRow.get('userId'));
		const tokenCreated = Number.parseInt(tokenRow.get('tokenCreated'));
		const token = tokenRow.get("token");
		if (
			!tokenUserId || !token || !tokenCreated || // Invalid Token
			isExpired(tokenCreated) || // ExpiredToken
			(tokenUserId === userId && found) // Duplicate ID
		) {
			deleteCount++;
			await tokenRow.delete();
		} else if (tokenUserId !== userId) { // Valid but Different ID
			continue;
		} else { // Valid Matching ID
			return [
				tokenRows[i],
				(i > 0) ? () => cleanupTokens(tokenSheet, i - 1) : null // Cleanup Rows above this one. Skip if this is the first row.
			];
		}
	}

	return null; // Not Found
}

/** Run by getTokenRow to continue the row cleanup after whatever is done with the searched row */
async function cleanupTokens(tokenSheet: GoogleSpreadsheetWorksheet, lastIndex: number): Promise<void> {
	const tokenRows: GoogleSpreadsheetRow<Partial<UserSession>>[] = await tokenSheet.getRows({ limit: lastIndex });

	let deleteCount = 0;
	for (let i = tokenRows.length -1; i >= 0; i--) { // iterate through rows backwards
		const tokenRow = tokenRows[i];
		const data = tokenRow.toObject();
		if (
			!data.userId || !data.token || !data.tokenCreated || // Invalid Token
			isExpired(data.tokenCreated) // ExpiredToken
		) {
			deleteCount++;
			await tokenRow.delete();
		}
	}
	await incrementMetadata(-deleteCount);
}

/** Generates, saves, and returns an auth token for the given user(Row). */
export async function assignToken(userId: UserId, checkExisting: boolean = false): Promise<UserSession | null> {
	const userToken = generateToken();


	const out = await getTokenRow(userId);
	// console.log('GENERATING TOKEN:', out);
	if (out) { // Update Existing Token
		const [tokenRow, cleanup] = out;
		tokenRow.assign({
			userId,
			...userToken
		});
		await tokenRow.save();
		await cleanup?.();
		// console.log('Updated Token:', tokenRow.toObject());
	} else if (checkExisting) {
		return null;
	} else { // Create New Token
		const tokenSheet = await getTokenSheet();
		const tokenRow = await tokenSheet.addRow({
			userId,
			...userToken
		});
		await incrementMetadata();
		// console.log('New Token:', tokenRow.toObject());
	}

	return {
		userId,
		...userToken
	};
}

export async function verifyToken(headers: Headers): Promise<UserSession | null> {
	const userId = toInt(headers.get('userId'));
	const token = headers.get('token');

	if (!userId || !token) { return null; }

	return await assignToken(userId, true);
}