import axios from "axios";
import { GoogleAuth } from "google-auth-library";
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from "google-spreadsheet";

type FlatTwoDimentionalArray<A> = [
	A[]
];

const USER_SHEET = 'users';

export function ensureLoggedIn() {
}

/**
 * Logs into and accesses the google spreadsheet
 */
export async function getGoogleSpreadsheet(): Promise<GoogleSpreadsheet> {
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
	} catch (e) {
		if (axios.isAxiosError(e)) {
			console.error('Message:', e.message); // "Google API error - [403] Request had insufficient authentication scopes."
			console.error('Name:', e.name); // "AxiosError"
			console.error('Code:', e.code); // "ERR_BAD_REQUEST"
			console.error('Status:', e.status); // 403
			console.error('Response Data:', JSON.stringify(e.response?.data)); // {"error":{"code":403,"message":"The caller does not have permission","status":"PERMISSION_DENIED"}}
			console.error('Response Headers:', JSON.stringify(e.response?.headers)); // {"vary":"Origin, X-Origin, Referer","content-type":"application/json; charset=UTF-8","date":"Mon, 24 Mar 2025 21:14:01 GMT","server":"ESF","x-xss-protection":"0","x-frame-options":"SAMEORIGIN","x-content-type-options":"nosniff","alt-svc":"h3=\":443\"; ma=2592000,h3-29=\":443\"; ma=2592000","x-l2-request-path":"l2-managed-6","transfer-encoding":"chunked"}
			console.error('Response Request:', JSON.stringify(e.response?.request)); // ERRORS
			console.error('Response Status:', JSON.stringify(e.response?.status)); // 403
			console.error('Response Status Text:', JSON.stringify(e.response?.statusText)); // Forbidden
		} else {
			console.error('typeof error:', typeof e);
			console.error('random error:', Object.keys(e as Object));
		}
		throw new Error('Could not get Google Sheet Document');
	}
}

/**
 * Gets (or creates if not existing) a sheet
 * In a given document. Will automatically get the google sheet if not already
 */
export async function getSheet(title: string, doc?: GoogleSpreadsheet): Promise<[GoogleSpreadsheetWorksheet, boolean]> {
	const document = doc ?? await getGoogleSpreadsheet();
	return document.sheetsByTitle[title] ?
		[document.sheetsByTitle[title], true] :
		[await document.addSheet({ title }), false];
}

/**
 * Gets (or creates if not existing) a sheet in a given document
 */
export async function getUserSheet(doc?: GoogleSpreadsheet): Promise<GoogleSpreadsheetWorksheet> {
	const [sheet, old] = await getSheet(USER_SHEET, doc);
	if (!old) {
		// Initialize Sheet data
		sheet.setHeaderRow(['userId', 'userName', 'password', 'touches', 'data']);
	}
	return sheet;
}

export async function checkUserLogin(userName: string, password: string): Promise<number | undefined> {
	const doc = await getGoogleSpreadsheet();
	const userSheet = await getUserSheet(doc);
	if (userSheet.rowCount < 2) { // no users exist
		return;
	}
	const userNameAddresses = `B2:B${userSheet.rowCount}`;
	await userSheet.loadCells(userNameAddresses);
	const userNames = (await userSheet.getCellsInRange(userNameAddresses, { majorDimension: "COLUMNS" }) as FlatTwoDimentionalArray<string>)[0];

	const userIndex = userNames.findIndex((checkUserName) => checkUserName === userName.toString());

	const userRow = (await userSheet.getRows({ offset: userIndex, limit: 1 }))[0];

	if (userRow.get('password') !== password) {
		return;
	}

	console.log('user:', userNames, userIndex, userRow.get('userName'));

	return userRow.get('userId');
}

export async function getUserData(userId: number) {
	const doc = await getGoogleSpreadsheet();
	const userSheet = await getUserSheet(doc);
	if (userSheet.rowCount < 2) { // no users exist
		return;
	}
	const userIdAddresses = `A2:A${userSheet.rowCount}`;

	await userSheet.loadCells(userIdAddresses);
	const userIds = (await userSheet.getCellsInRange(userIdAddresses, { majorDimension: "COLUMNS" }) as FlatTwoDimentionalArray<string>)[0];

	const userIndex = userIds.findIndex((checkId) => checkId === userId.toString());

	const userRow = (await userSheet.getRows({ offset: userIndex, limit: 1 }))[0];

	console.log('user:', userIds, userIndex, userRow.get('userName'));


	return {
		userId,
		userName: userRow.get('userName'),
		touches: userRow.get('touches'),
		data: userRow.get('data')
	};
}
