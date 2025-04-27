"use client";
import styles from "./Login.module.css";
import { useLoginMutation } from "@/src/lib/store/slices/sheetsApiSlice";

export const Login = () => {
	const [ login, { isError, error, data, reset, isLoading, isUninitialized, isSuccess } ] = useLoginMutation();

	const submitLogin = async (formData: FormData) => {
		login({
			userName: formData.get('userName') as string, // TODO: handle this better than coersion
			password: formData.get('password') as string
		})
	};

	return <div className={styles.container}>
		{isError && <div>
			<h1>There was an error: {JSON.stringify(error)}</h1>
		</div>}

		{isLoading && <div>
			<h1>Loading...</h1>
		</div>}

		{(isUninitialized || isError) && <form action={submitLogin} className={styles.form}>
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

		{/* This isn't really shown */}
		{isSuccess && <div>
			Logged In!
		</div>}
	</div>
};
