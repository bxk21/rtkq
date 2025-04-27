'use client';

import { selectUserId } from "@/src/lib/store/slices/tokenSlice";
import { useSelector } from "react-redux";
import { NewUser } from "./NewUser";
import { Login } from "./Login";
import { useEffect } from "react";
import { redirect } from "next/navigation";
import Tabs from "@/src/components/tabs/Tabs";

export default function LoginOrNewUser() {
	const userId = useSelector(selectUserId);

	useEffect(() => {
		if (userId) {
			redirect('/data');
		}
	}, [userId]);

	return <Tabs
		tabOptions={['New User', 'Login']}
		bodies={[
			<NewUser/>,
			<Login/>
		]}
	/>;
}
