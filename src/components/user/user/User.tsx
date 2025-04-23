'use client';

import { selectUserId } from "@/src/lib/store/slices/tokenSlice";
import { useSelector } from "react-redux";
import { NewUser } from "../newUser/NewUser";
import { Login } from "../login/Login";
import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function User() {
	const userId = useSelector(selectUserId);

	useEffect(() => {
		if (userId) {
			redirect('/');
		}
	}, [userId]);

	return <div>
		{!userId && <div>
			<NewUser/>
			<Login/>
		</div>}
	</div>
}
