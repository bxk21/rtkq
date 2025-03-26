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








		// await doc.updateProperties({ title: 'renamed doc' });
		// const sheet = doc.sheetsByIndex[0]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
		// console.log(sheet.title);
		// console.log(sheet.rowCount);
		// const newSheet = await doc.addSheet({ title: 'another sheet' }); // adding / removing sheets
		// await newSheet.delete();
		return doc;
	} catch (e) {
		if (axios.isAxiosError(e)) {
			console.error('Message:', e.message); // "Google API error - [403] Request had insufficient authentication scopes."
			console.error('Name:', e.name); // "AxiosError"
			console.error('Code:', e.code); // "ERR_BAD_REQUEST"
			console.error('Status:', e.status); // 403











































			// console.error('Response Config:', JSON.stringify(e.response?.config));
			/*
				{
					"transitional": {
						"silentJSONParsing": true,
						"forcedJSONParsing": true,
						"clarifyTimeoutError": false
					},
					"adapter": [
						"xhr",
						"http",
						"fetch"
					],
					"transformRequest": [
						null
					],
					"transformResponse": [
						null
					],
					"timeout": 0,
					"xsrfCookieName": "XSRF-TOKEN",
					"xsrfHeaderName": "X-XSRF-TOKEN",
					"maxContentLength": null,
					"maxBodyLength": null,
					"env": {},
					"headers": {
						"Accept": "application/json, text/plain, * /*",
						"Authorization": "Bearer ya29.c.c0ASRK0GYa8FfHB1YxidpnyKHs9xju4qLJdgAdn6rj6Q128U2lmy0rbvTU2dv52-4wvfyYqhGgsHOH6fByUGPSejhAg9qvEs8ylqdIuqnnpsWWvBHUyaTDImjL8u1ahQt1w81Z2fRcyRHHixheP5gz88qptsop0BjGGq_lgwABDQaXsz719jx71yzJudl0gBv5KWJ6tGzRYbJdutn8aj4vz31zcTvL160GFCOf1Lt8bGddKfx8K8Z0pZf2xFfNWP6M28CSClmrnlhy7F_CjcfXVzYcAqGm9jTlZTqdYC7eBppkj2Xr5kKb6KYTN670cEelkqs6ktJnQXx5nYuPKQOcpES3_-TwIAWHQVeAA7vFj5-4HDk55_LZjbPPT385Ag31Om26Mz0y1IyujOoo6tQ6trX-YRzd-IXVJuu1svjvJsSvVdqe945d8wm6FlFd0vO_W3idsmJWtai-nucpXmzrV2oVWQkRl0jWzfFBbSymRIbtFuM65WJma0-6YRuXM-_utSFekn2e2fJVIQFhUQxmRcYynvtmM-z_1-4Z-08tSsVjsaO6zhFM_JIfRzcnp5oJkb4mwjpJ2x-w0fbvfIfJpt8yJSI31mXwqI4bob50i30bvu3-V2uus8azkh7MiO3BfgXgu6x96tzwgxWR-3lyJBcF04tXsuvf-nss0s2bkfnX2M8FodvkRSWo4yUj426y0nosdu9nqZh2FwOIy555qOUpB9rwcgws9hr6W18QtRMeZacpV12MIt7uynUvyaUX6fBli3o1J68xOyj628nng7pXt91WFl2vO0MtXsIbRF12qU60rXaXZlwudReoRmIresaS9bx3iYR1vrbJ9Bo0Q9pRu-o6_1O7k5Yzctjaq2S5JoSki9x-3jlkr_U-R-sm-eg-pfVOmIyv0MlOrWgVcBaoQmS53_m3WoUvIbS7wbl2F4wgyUtRlIibnM2hp31aWFM9JYJyv7cFFivUbR2inwj85la19XfQS1Mna43X2SnUgjssZ8Ul660",
						"User-Agent": "axios/1.8.4",
						"Accept-Encoding": "gzip, compress, deflate, br"
					},
					"baseURL": "https://sheets.googleapis.com/v4/spreadsheets/15khpXBGDUQmfiulnS4NK6bEuZ3N9umrBuBCkt9XgG1g",
					"paramsSerializer": {},
					"params": {},
					"method": "get",
					"url": "/",
					"allowAbsoluteUrls": true
					}
			*/
			// console.error('Response Data:', JSON.stringify(e.response?.data)); // {"error":{"code":403,"message":"The caller does not have permission","status":"PERMISSION_DENIED"}}
			// console.error('Response Headers:', JSON.stringify(e.response?.headers)); // {"vary":"Origin, X-Origin, Referer","content-type":"application/json; charset=UTF-8","date":"Mon, 24 Mar 2025 21:14:01 GMT","server":"ESF","x-xss-protection":"0","x-frame-options":"SAMEORIGIN","x-content-type-options":"nosniff","alt-svc":"h3=\":443\"; ma=2592000,h3-29=\":443\"; ma=2592000","x-l2-request-path":"l2-managed-6","transfer-encoding":"chunked"}
			// console.error('Response Request:', JSON.stringify(e.response?.request)); // ERRORS
			// console.error('Response Status:', JSON.stringify(e.response?.status)); // 403
			console.error('Response Status Text:', JSON.stringify(e.response?.statusText)); // Forbidden









































			// console.error('Config:\n' + JSON.stringify(e.config));
			/*
				{
					"transitional": {
						"silentJSONParsing": true,
						"forcedJSONParsing": true,
						"clarifyTimeoutError": false
					},
					"adapter": [
						"xhr",
						"http",
						"fetch"
					],
					"transformRequest": [
						null
					],
					"transformResponse": [
						null
					],
					"timeout": 0,
					"xsrfCookieName": "XSRF-TOKEN",
					"xsrfHeaderName": "X-XSRF-TOKEN",
					"maxContentLength": null,
					"maxBodyLength": null,
					"env": {},
					"headers": {
						"Accept": "application/json, text/plain, * /*",
						"Authorization": "Bearer ya29.c. ...",
						"User-Agent": "axios/1.8.4",
						"Accept-Encoding": "gzip, compress, deflate, br"
					},
					"baseURL": "https://sheets.googleapis.com/v4/spreadsheets/15khpXBGDUQmfiulnS4NK6bEuZ3N9umrBuBCkt9XgG1g",
					"paramsSerializer": {},
					"params": {},
					"method": "get",
					"url": "/",
					"allowAbsoluteUrls": true
				}
			*/
			// console.error('Request:', Object.keys(e.request)); // _events,_eventsCount,_maxListeners,outputData,outputSize,writable,destroyed,_last,chunkedEncoding,shouldKeepAlive,maxRequestsOnConnectionReached,_defaultKeepAlive,useChunkedEncodingByDefault,sendDate,_removedConnection,_rem_removedContLen,_removedTE,strictContentLength,_contentLength,_hasBody,_trailer,finished,_headerSent,_closed,_header,_keepAliveTimeout,_onPendingData,agent,socketPath,method,maxHeaderSize,insecureHTTPParser,joinDuplicateHeaders,path,_ended,res,aborted,timeoders,path,_ended,res,aborted,timeoutCb,upgradeOrConnect,parser,maxHeadersCount,reusedSocket,host,protocol,_redirectable
			// return e;
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
