"use client";
import { useSelector } from "react-redux";
import { selectUserId } from "@/src/lib/store/slices/tokenSlice";
import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function mainPage() {
	const userId = useSelector(selectUserId);
	
	useEffect(() => {
		redirect('/data');
	}, []);
};
