import { verifyToken } from "@/src/lib/backend/sheets/token";
import { getUserData } from "@/src/lib/backend/sheets/user";
import { UserInfo } from "@/src/lib/types/userTypes";
import { HttpStatusCode } from "axios";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface Context {
	params: {
		userId: number
	};
}

/**
 * Gets a User's Info
 * @returns {} // FIXME Does this work?
 */
export async function GET(request: NextRequest, context: Context): Promise<NextResponse<UserInfo | null>> {
	const token = await verifyToken(request.headers);
	if (!token) { return NextResponse.json(null, {status: HttpStatusCode.Unauthorized, statusText: 'Not Logged In'}); }

	const { userId } = await context.params;
	const data = await getUserData(userId);
	if (data) {
		return NextResponse.json(
			data,
			{
				headers: {
					userId: userId.toString(),
					token: token.token,
					tokenCreated: token.tokenCreated.toString()
				}
			}
		);
	} else {
		// Return 204: No Content
		// return new Response(null, {status: 204, statusText: 'No User Found'});
		return NextResponse.json(null, {status: 400, statusText: 'Unknown Error'});
	}
}

/**
 * Updates a User's Info
 * @param request 
 * @param context 
 * @returns 
 */
export async function PATCH(request: NextRequest, context: Context) {
	const body: Partial<UserInfo> = await request.json();
	// const { amount = 1 } = body;

	// return NextResponse.json({ data: amount });
}
