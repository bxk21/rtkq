import { loginUser } from "@/lib/backend/auth/sheets";
import { LoginInfo } from "@/lib/types/userTypes";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface Context {
	params: undefined;
}

export async function PUT(request: NextRequest, context: Context) {
	const body: { username: string, password: string } = await request.json();
	request.headers.get('X-Forwarded-For');
}

/**
 * TODO: Proper Login Procedure
 * https://authjs.dev/getting-started/authentication/credentials
 * Hash Password + more?
 * Check username + hash against database
 * if not confirmed, return error
 * // return NextResponse.json(null, {status: 401, statusText: 'Invalid Username or Password'})
 * Return a JWT Token
 */
export async function POST(request: NextRequest, context: Context) {
	const body: LoginInfo = await request.json();
	const { userName, password } = body;

	const userId = await loginUser(userName, password);

	if (!userId) {
		return NextResponse.json(null, { status: 401, statusText: 'Incorrect Username and/or Password' })
		// return new Response(null, {status: 401, statusText: 'Incorrect Username and/or Password'});
	} else {
		return NextResponse.json(userId);
	}
}
