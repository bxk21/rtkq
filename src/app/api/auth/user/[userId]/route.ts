import { verifyToken } from "@/src/lib/backend/sheets/token";
import { getUserData, isAdmin } from "@/src/lib/backend/sheets/user";
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
 * @returns {} // FIXME Does this work?
 */
export async function GET(request: NextRequest, context: Context): Promise<NextResponse<Partial<UserInfo> | null>> {
	const token = await verifyToken(request.headers);
	if (!token) { return NextResponse.json(null, {status: HttpStatusCode.Unauthorized, statusText: 'Not Logged In'}); }

	const userId = Number.parseInt((await context.params).userId);
	if (token.userId !== userId && !await isAdmin(token.userId)) { return NextResponse.json(null, {status: HttpStatusCode.Unauthorized, statusText: 'This User cannot Get other User\'s Info'}); }

	const data = await getUserData(userId);
	if (!data) { return NextResponse.json(null, {status: HttpStatusCode.InternalServerError, statusText: 'Server Failed to get User Data'}); }

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
}

/**
 * Updates a User's Info
 * @param request 
 * @param context 
 * @returns 
 */
export async function PATCH(request: NextRequest): Promise<NextResponse<true | null>> {
	const body: Partial<UserInfo> = await request.json();
	// const { amount = 1 } = body;

	return NextResponse.json(true);
}
