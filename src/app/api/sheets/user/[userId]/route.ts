import { verifyAndRefreshToken } from "@/src/lib/backend/sheets/token";
import { getRoles, getUserData, getUserRow, hasPerms } from "@/src/lib/backend/sheets/user";
import { withLock } from "@/src/lib/backend/util/lock";
import { UserInfo } from "@/src/lib/types/userTypes";
import { HttpStatusCode } from "axios";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface Context {
	params: Promise<{
		userId: string
	}>
}

/**
 * Gets a User's Info
 */
export async function GET(request: NextRequest, context: Context): Promise<NextResponse<Partial<UserInfo> | null>> {
	const requestedUserId = Number.parseInt((await context.params).userId);
	return await withLock(async (): Promise<NextResponse<Partial<UserInfo> | null>> => {
		const token = await verifyAndRefreshToken(request.headers);
		if (!token) { return NextResponse.json(null, {status: HttpStatusCode.Unauthorized, statusText: 'Not Logged In'}); }

		if (token.userId !== requestedUserId) { // Requesting Other User
			if ((await getRoles(requestedUserId)).includes('admin')) { // If the other user is an Admin
				if (!await hasPerms(token.userId, "readAdmins")) {
					return NextResponse.json(null, {status: HttpStatusCode.Unauthorized, statusText: 'This User cannot Read other Admin\'s Info'});
				}
			} else {
				if (!await hasPerms(token.userId, "readUsers")) {
					return NextResponse.json(null, {status: HttpStatusCode.Unauthorized, statusText: 'This User cannot Read other User\'s Info'});
				}
			}
		} else if (!await hasPerms(token.userId, "readSelf")) {
			return NextResponse.json(null, {status: HttpStatusCode.Unauthorized, statusText: 'This User cannot Read its own Info'});
		}

		const data = await getUserData(requestedUserId);
		if (!data) { return NextResponse.json(null, {status: HttpStatusCode.InternalServerError, statusText: 'Server Failed to Read User Data'}); }

		return NextResponse.json(
			data,
			{
				headers: {
					userId: token.userId.toString(),
					token: token.token,
					tokenCreated: token.tokenCreated.toString()
				}
			}
		);
	}, 'Get User Info: ' + requestedUserId).catch((error) => {
		console.error('Server Error while Getting User Info: '+ error);
		return NextResponse.json(null, {status: HttpStatusCode.InternalServerError});
	});

}

/**
 * Updates a User's Info
 */
export async function PATCH(request: NextRequest, context: Context): Promise<NextResponse<boolean | null>> {
	const body: Partial<UserInfo> = await request.json();
	const requestedUserId = Number.parseInt((await context.params).userId);
	
	return await withLock(async (): Promise<NextResponse<boolean | null>> => {
		const token = await verifyAndRefreshToken(request.headers);
		if (!token) { return NextResponse.json(null, {status: HttpStatusCode.Unauthorized, statusText: 'Not Logged In'}); }

		// ======== Permissions ========

		if (token.userId !== requestedUserId) { // Requesting Other User
			if ((await getRoles(requestedUserId)).includes('admin')) { // If the other user is an Admin
				if (!await hasPerms(token.userId, "editAdmins")) {
					return NextResponse.json(null, {status: HttpStatusCode.Unauthorized, statusText: 'This User cannot Edit other Admin\'s Info'});
				}
			} else {
				if (!await hasPerms(token.userId, "editUsers")) {
					return NextResponse.json(null, {status: HttpStatusCode.Unauthorized, statusText: 'This User cannot Edit other User\'s Info'});
				}
			}
		} else if (!await hasPerms(token.userId, "editSelf")) {
			return NextResponse.json(null, {status: HttpStatusCode.Unauthorized, statusText: 'This User cannot Edit its own Info'});
		}

		const userRow = await getUserRow({ userId: requestedUserId });
		if (!userRow) { return NextResponse.json(null, {status: HttpStatusCode.InternalServerError, statusText: 'Server Failed to Read User Data'}); }

		// ======== Validations ========

		if (body.data && body.data.length > 50000) { return NextResponse.json(null, {status: HttpStatusCode.PayloadTooLarge, statusText: 'Data cannot be more than 50000 characters'}); }

		// ========

		userRow.assign({
			data: body.data && body.data.length < 50000 ? body.data : undefined
		});
		await userRow.save();

		return NextResponse.json(
			true,
			{
				headers: {
					userId: token.userId.toString(),
					token: token.token,
					tokenCreated: token.tokenCreated.toString()
				}
			}
		);
	}, 'Patch User Info: ' + requestedUserId).catch((error) => {
		console.error('Server Error while Patching User Info: '+ error);
		return NextResponse.json(null, {status: HttpStatusCode.InternalServerError});
	});
}
