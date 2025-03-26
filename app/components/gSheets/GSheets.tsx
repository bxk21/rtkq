"use client";
import { useState } from "react";
import styles from "./Quotes.module.css";
import { useGetTouchesQuery, useTouchMutation } from "@/lib/frontend/slices/gSheets/gSheetsApiSlice";

export const GSheets = () => {
	const [numberOfQuotes, setNumberOfQuotes] = useState(10);
	const {
	  isError,
	  isLoading,
	  isSuccess,
	  error,
	  data: touches
	  } = useGetTouchesQuery();
	const [ touch, touchResult ] = useTouchMutation();

	return <div>
		{isError && <div>
				<h1>There was an error: {error.toString()}</h1>
			</div>}

		{isLoading && <div>
			<h1>Loading...</h1>
		</div>}

		{isSuccess && <div className={styles.container}>
			Touches: {touches}
		</div>}
	</div>
};
