import { Sheet } from "@/lib/backend/auth/sheets";
import { UserInfo } from "@/lib/types/userTypes";
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
 * @returns {Promise<NextResponse<UserInfo>>} // FIXME Does this work?
 */
export async function GET(request: NextRequest, context: Context) {
	const { userId } = await context.params;
	// TODO: Actually get from data
	const data = await new Sheet().getUserData(userId);
	if (data) {
		return NextResponse.json({ data });
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
