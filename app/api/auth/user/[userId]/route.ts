import { checkUserLogin, getUserData } from "@/lib/backend/auth/sheets";
import { UserId, UserInfo } from "@/lib/def/user";
import { useRouter } from "next/router";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface Context {
	params: {
		userId: number
	};
}

/**
 * Gets a User's Info
 * @param request 
 * @param context 
 * @returns {NextResponse<UserInfo>} // FIXME Does this work?
 */
export async function GET(request: NextRequest, context: Context) {
	const { userId } = await context.params;
	// TODO: Actually get from data
	const data = await getUserData(userId);
	if (data) {
		return NextResponse.json({
			data
			// data: {
			// 	userId: -1,
			// 	userName: 'mockUser',
			// 	touches: 12345678,
			// 	data: JSON.stringify(data) || data || 'mockData'
			// }
		});
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
