"use client";
import { skipToken } from "@reduxjs/toolkit/query";
import styles from "./Login.module.css";
import { useGetUserInfoQuery, useLoginMutation, useNewUserMutation } from "@/lib/frontend/slices/sheets/sheetsApiSlice";
// import { signIn } from "@/auth";

export const Login = () => {
	const [ login, { isError: loginIsError, error: loginError, data: userSession, reset: resetLogin } ] = useLoginMutation();
	const [ newUser, { isError: newUserIsError, error: newUserError, reset: resetNewUser } ] = useNewUserMutation();
	const {
		isUninitialized,
		isError: getUserIsError,
		isLoading,
		isSuccess,
		error: getUserError,
		data: userInfo
	} = useGetUserInfoQuery(userSession?.userId ?? skipToken);

	const isError = loginIsError || newUserIsError || getUserIsError;
	const error =
		(loginIsError ? JSON.stringify(loginError) : '') +
		(newUserIsError ? JSON.stringify(newUserError) : '') +
		(getUserIsError ? JSON.stringify(getUserError) : '');

	const submitLogin = async (formData: FormData) => {
		resetNewUser(); // Remove errors from New User
		login({
			userName: formData.get('userName') as string, // TODO: handle this better than coersion
			password: formData.get('password') as string
		})
	};

	const submitNewUser = async (formData: FormData) => {
		resetLogin(); // Remove errors from Login
		newUser({
			userName: formData.get('userName') as string, // TODO: handle this better than coersion
			password: formData.get('password') as string
		})
	};

	return <div>
		{isError && <div>
			<h1>There was an error: {error}</h1>
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

		{(isUninitialized || isError) && <form action={submitNewUser}>
			<label>
				Username: <input name="userName" type="string"/>
			</label>
			<label>
				Password: <input name="password" type="password"/>
			</label>
			<button type="submit">
				New User
			</button>
		</form>}

		{isSuccess && userInfo && <div className={styles.container}>
			{Object.entries(userInfo).map(([key, value], i) => <div key={i}>
				{key} : {value}
			</div>)}
		</div>}
	</div>
};
