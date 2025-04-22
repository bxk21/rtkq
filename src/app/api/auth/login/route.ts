import { createUserAccount, loginUser } from "@/src/lib/backend/sheets/user";
import { withLock } from "@/src/lib/backend/util/lock";
import { LoginInfo } from "@/src/lib/types/userTypes";
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
		const error = await createUserAccount(userName, password);

		if (!error) {
			return NextResponse.json({confirmed: true});
		} else {
			return NextResponse.json(null, error);
		}
	}, 'New User: ' + userName).catch((_error) => {
		console.log('caught error', _error);
		return NextResponse.json(null, {status: HttpStatusCode.InternalServerError});
	});
}

/**
 * Logs a user In
 */
export async function POST(request: NextRequest, context: Context) {
	const { userName, password }: LoginInfo = await request.json();
	return await withLock(
		async () => {
			const userSession = await loginUser(userName, password);

			if (!userSession) {
				return NextResponse.json(null, { status: HttpStatusCode.Unauthorized, statusText: 'Incorrect Username and/or Password' });
			} else {
				return NextResponse.json(
					true,
					{
						headers: {
							userId: userSession.userId.toString(),
							token: userSession.token,
							tokenCreated: userSession.tokenCreated.toString()
						}
					}
				);
			}
		}, 'Log In: ' + userName
	).catch((_error) => {
		console.log('caught error', _error);
		return NextResponse.json(null, {status: HttpStatusCode.InternalServerError});
	});
}
