import { GoogleAuth } from "google-auth-library";
import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from "google-spreadsheet";

// const LOCK_SHEET = 'lock';

let sheet: GoogleSpreadsheet | undefined;

// ======== Sheets Helper Functions ========

/** Logs into and accesses the google spreadsheet. */
async function getGoogleSpreadsheet(): Promise<GoogleSpreadsheet> {
	if (sheet) { return sheet; }

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
		sheet = doc;
		return doc;
	} catch (e: any) {
		throw new Error('Could not get Google Sheet Document: ' + e?.message);
	}
}

/** Gets (or creates if not existing) a sheet in a given document. Will automatically create the google doc if not already. */
export async function getSheet(title: string): Promise<[GoogleSpreadsheetWorksheet, boolean]> {
	const document = await getGoogleSpreadsheet();
	return document.sheetsByTitle[title] ?
		[document.sheetsByTitle[title], true] :
		[await document.addSheet({ title }), false];
}
