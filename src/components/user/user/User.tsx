'use client';

import { selectUserId } from "@/src/lib/store/slices/tokenSlice";
import { useSelector } from "react-redux";
import { NewUser } from "../newUser/NewUser";
import { Login } from "../login/Login";

export default function User() {
	const userId = useSelector(selectUserId);

	return <div>
		{!userId && <div>
			<NewUser/>
			<Login/>
		</div>}
	</div>
}
