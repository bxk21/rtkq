import { createUserAccount, loginUser } from "@/src/lib/backend/sheets/user";
import { withLock } from "@/src/lib/backend/util/lock";
import { LoginInfo } from "@/src/lib/types/userTypes";
import { HttpStatusCode } from "axios";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Creates a User Account
 */
export async function PUT(request: NextRequest): Promise<NextResponse<true | null>> {
	const { userName, password }: LoginInfo = await request.json();
	return await withLock(async (): Promise<NextResponse<true | null>> => {
		const error = await createUserAccount(userName, password);

		if (!error) {
			return NextResponse.json(true);
		} else {
			return NextResponse.json(null, error);
		}
	}, 'New User: ' + userName).catch((error) => {
		console.error('Server Error while Creating User Account: '+ error);
		return NextResponse.json(null, {status: HttpStatusCode.InternalServerError});
	});
}

/**
 * Logs a user In
 */
export async function POST(request: NextRequest): Promise<NextResponse<true | null>> {
	const { userName, password }: LoginInfo = await request.json();
	return await withLock(
		async (): Promise<NextResponse<true | null>> => {
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
	).catch((error) => {
		console.error('Server Error while Logging In: '+ error);
		return NextResponse.json(null, {status: HttpStatusCode.InternalServerError});
	});
}
