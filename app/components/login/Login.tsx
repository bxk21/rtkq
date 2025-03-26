"use client";
import { skipToken } from "@reduxjs/toolkit/query";
import styles from "./Login.module.css";
import { useGetUserInfoQuery, useLoginMutation } from "@/lib/frontend/slices/local/localApiSlice";
import { signIn } from "@/auth";

export const Login = () => {
	const [ login, { data: userId } ] = useLoginMutation();
	const {
		isUninitialized,
		isError,
		isLoading,
		isSuccess,
		error,
		data: userInfo
	} = useGetUserInfoQuery(userId ?? skipToken);

	const submitLogin = async (formData: FormData) => {
		// signIn('credentials', formData);
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

		{isSuccess && userInfo && <div className={styles.container}>
			{Object.entries(userInfo).map(([key, value], i) => <div key={i}>
				{key} : {value}
			</div>)}
		</div>}
	</div>
};
