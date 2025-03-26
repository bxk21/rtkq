import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { signInSchema } from "./lib/backend/validation/zod"
// TODO
// Your own logic for dealing with plaintext password strings; be careful!
// import { saltAndHashPassword } from "@/utils/password"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		Credentials({
			// You can specify which fields should be submitted, by adding keys to the `credentials` object.
			// e.g. domain, username, password, 2FA token, etc.
			credentials: {
				// email: {},
				userName: {},
				password: {},
			},
			authorize: async (credentials) => {
				let user = null
 
				// logic to salt and hash password

				const { userName, password } = signInSchema.parse(credentials)
				// const pwHash = saltAndHashPassword(credentials.password)
				// const pwHash = 
 
				// logic to verify if the user exists
				// user = await getUserFromDb(credentials.email, pwHash)
 
				if (!user) {
					// No user found, so this is their first attempt to login
					// Optionally, this is also the place you could do a user registration
					throw new Error("Invalid credentials.")
				}

				// user = new User
 
				// return user object with their profile data
				return user
			},
		}),
	],
})