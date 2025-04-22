"use client";
import { selectUserId } from "@/src/lib/store/slices/tokenSlice";
import styles from "./UserInfo.module.css";
import { useGetUserInfoQuery } from "@/src/lib/store/slices/sheetsApiSlice";
import { useSelector } from "react-redux";
import { skipToken } from "@reduxjs/toolkit/query";
import Link from "next/link";

export const UserInfo = () => {
	const userId = useSelector(selectUserId);
	const {
		isUninitialized,
		isError,
		isLoading,
		isSuccess,
		error,
		data
	} = useGetUserInfoQuery(userId ?? skipToken);

	return <div>
		{isUninitialized && <Link href="/user">
			Login / Sign Up
		</Link>}

		{isError && <div>
			<h1>There was an error: {JSON.stringify(error)}</h1>
		</div>}

		{isLoading && <div>
			<h1>Logging In...</h1>
		</div>}

		{isSuccess && data && <div className={styles.header}>
			<div> Welcome, {data.userName}!</div>
			{/* {Object.entries(data).map(([key, value], i) => <div key={i}>
				{key} : {value}
			</div>)} */}
		</div>}
	</div>
};
