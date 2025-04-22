import { METADATA_DATA, MetadataKey, Metadata, METEDATA_INDEX_A1, METADATA_SHEET } from "@/src/lib/types/userTypes";
import { GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import { getSheet } from "./sheets";

let metadataWorksheet: GoogleSpreadsheetWorksheet | undefined;

/** Gets (or creates if not existing) the metadata sheet in a given document. */
async function getMetaDataSheet(): Promise<GoogleSpreadsheetWorksheet> {
	if (metadataWorksheet) { return metadataWorksheet; }

	const [sheet, old] = await getSheet(METADATA_SHEET);
	if (!old) {
		// Initialize Sheet data
		await sheet.setHeaderRow(METADATA_DATA);
		await sheet.addRows([
			['lastMetadataIndex', 3],
			['lastUserIndex', 0],
			['lastTokenIndex', 0]
		]);
	}

	metadataWorksheet = sheet;

	return sheet;
}

/** Gets a piece of metadata by the key and its address in a tuple. */
export async function getMetaData(key: MetadataKey): Promise<GoogleSpreadsheetRow<Partial<Metadata>>> {
	const metadataWorksheet = await getMetaDataSheet();
	await metadataWorksheet.loadCells(METEDATA_INDEX_A1);
	const metadataSizeCell = metadataWorksheet.getCellByA1(METEDATA_INDEX_A1);
	if (!metadataSizeCell.numberValue) {
		// metadataSizeCell.numberValue = METADATA_COLUMNS.length;
		// metadataSizeCell.save();
		throw new Error('lastMetadataIndex not found');
	}
	const rows: GoogleSpreadsheetRow<Partial<Metadata>>[] = await metadataWorksheet.getRows({ limit: metadataSizeCell.numberValue + 1 });
	let dataRow = rows.find((row) => row.get("key") === key);
	if (!dataRow) {
		dataRow = await metadataWorksheet.addRow({ key, value: '' });
		metadataSizeCell.numberValue += 1;
		await metadataSizeCell.save();
	}
	return dataRow;
}

export async function setMetaData(key: MetadataKey, value: string | number | ((dataRow: GoogleSpreadsheetRow<Partial<Metadata>>) => string | number)): Promise<void> {
	const dataRow = await getMetaData(key);
	if (typeof value === 'function') {
		dataRow.set('value', value(dataRow))
	} else {
		dataRow.set('value', value);
	}
	await dataRow.save();
}