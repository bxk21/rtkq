import { Sheet } from "@/lib/backend/auth/sheets";
import { withLock } from "@/lib/backend/util/lock";
import { LoginInfo } from "@/lib/types/userTypes";
import { HttpStatusCode } from "axios";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface Context {
	params: undefined;
}

// export async function PUT(request: NextRequest, context: Context) {
// 	const body: { username: string, password: string } = await request.json();
// 	const ip = request.headers.get('X-Forwarded-For'); // get IP address
// }

/**
 * Creates a User Account
 */
export async function PUT(request: NextRequest, context: Context) {
	const { userName, password }: LoginInfo = await request.json();
	return await withLock(async () => {
		const error = await new Sheet().createUserAccount(userName, password);

		if (!error) {
			return NextResponse.json({confirmed: true});
		} else {
			return NextResponse.json(null, error);
		}
	}, userName).catch((_error) => {
		console.log('caught error', _error);
		return NextResponse.json(null, {status: HttpStatusCode.InternalServerError});
	});
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
	const { userName, password }: LoginInfo = await request.json();

	const userSession = await new Sheet().loginUser(userName, password);

	if (!userSession) {
		return NextResponse.json(null, { status: 401, statusText: 'Incorrect Username and/or Password' })
	} else {
		return NextResponse.json(
			userSession.userId,
			{
				headers: {
					token: userSession.token,
					tokenCreated: userSession.tokenCreated.toString()
				}
			}
		);
	}
}
