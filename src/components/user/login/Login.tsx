"use client";
import { skipToken } from "@reduxjs/toolkit/query";
import styles from "./Login.module.css";
import { useGetUserInfoQuery, useLoginMutation, useNewUserMutation } from "@/src/lib/store/slices/sheetsApiSlice";
import { UserInfo } from "../userInfo/UserInfo";
// import { signIn } from "@/auth";

export const Login = () => {
	const [ login, { isError, error, data, reset, isLoading, isUninitialized, isSuccess } ] = useLoginMutation();
	// const [ newUser, { isError: newUserIsError, error: newUserError, reset: resetNewUser } ] = useNewUserMutation();

	// const isError = loginIsError || newUserIsError;
	// const error =
	// 	(loginIsError ? JSON.stringify(loginError) : '') +
	// 	(newUserIsError ? JSON.stringify(newUserError) : '');
	// 	// (getUserIsError ? JSON.stringify(getUserError) : '');

	const submitLogin = async (formData: FormData) => {
		// resetNewUser(); // Remove errors from New User
		login({
			userName: formData.get('userName') as string, // TODO: handle this better than coersion
			password: formData.get('password') as string
		})
	};

	return <div>
		{isError && <div>
			<h1>There was an error: {JSON.stringify(error)}</h1>
		</div>}

		{isLoading && <div>
			<h1>Loading...</h1>
		</div>}

		{(isUninitialized || isError) && <form action={submitLogin}>
			<label>
				Username: <input name="userName" type="string"/>
			</label>
			<label>
				Password: <input name="password" type="password"/>
			</label>
			<button type="submit">
				Login
			</button>
		</form>}

		{isSuccess && <div className={styles.container}>
			Logged In!
			<UserInfo/>
		</div>}
	</div>
};
