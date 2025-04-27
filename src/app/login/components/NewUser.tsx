"use client";
import styles from "./Login.module.css";
import { useNewUserMutation } from "@/src/lib/store/slices/sheetsApiSlice";

export const NewUser = () => {
	const [ newUser, { isError, error, reset, isLoading, isUninitialized, isSuccess } ] = useNewUserMutation();

	const submitNewUser = async (formData: FormData) => {
		newUser({
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

		{(isUninitialized || isError) && <form action={submitNewUser} className={styles.form}>
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

		{isSuccess && <div>
			User Created!
		</div>}
	</div>
};
