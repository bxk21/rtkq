"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "../styles/layout.module.css";
import { useSelector } from "react-redux";
import { selectUserId } from "../lib/store/slices/tokenSlice";
import { useGetUserInfoQuery } from "../lib/store/slices/sheetsApiSlice";
import { skipToken } from "@reduxjs/toolkit/query";

export const Nav = () => {
	const userId = useSelector(selectUserId);
	const { data } = useGetUserInfoQuery(userId ?? skipToken);
  const pathname = usePathname();
  console.log('data', data);

  return (
    <nav className={styles.nav}>
      <Link
        className={`${styles.link} ${pathname === "/" ? styles.active : ""}`}
        href="/"
      >
        Home
      </Link>
      <Link
        className={`${styles.link} ${pathname === "/" ? styles.active : ""}`}
        href="/" hidden={!data?.isAdmin}
      >
        Admin
      </Link>
      {/* <Link
        className={`${styles.link} ${
          pathname === "/login" ? styles.active : ""
        }`}
        href="/login"
      >
        Login
      </Link> */}
    </nav>
  );
};
