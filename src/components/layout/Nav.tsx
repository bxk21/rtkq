"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "@/src/styles/layout.module.css";
import { useSelector } from "react-redux";
import { selectUserId } from "@/src/lib/store/slices/tokenSlice";
import { useGetUserInfoQuery } from "@/src/lib/store/slices/sheetsApiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { hasAccountType } from "@/src/lib/util/permissions";

export const Nav = () => {
	const userId = useSelector(selectUserId);
	const { data } = useGetUserInfoQuery(userId ?? skipToken);
	const pathname = usePathname();
	// console.log('data', data);

	return (
		<nav className={styles.nav}>
			<Link
				className={`${styles.link} ${pathname === "/" ? styles.active : ""}`}
				href="/"
			>
				Home
			</Link>
			<Link
				className={`${styles.link} ${pathname === "/settings" ? styles.active : ""}`}
				href="/settings" hidden={!hasAccountType(data?.accountTypes, "user")}
			>
				Settings
			</Link>
			<Link
				className={`${styles.link} ${pathname === "/admin" ? styles.active : ""}`}
				href="/admin" hidden={!hasAccountType(data?.accountTypes, "admin")}
			>
				Admin
			</Link>
		</nav>
	);
};
