"use client";
import { useState } from "react";
import styles from "./Quotes.module.css";
import { useGetTouchesQuery, useLoginQuery, useTouchMutation } from "@/lib/features/gSheets/gSheetsApiSlice";

export const GSheets = () => {
  const [numberOfQuotes, setNumberOfQuotes] = useState(10);
  // Using a query hook automatically fetches data and returns query values
  const {
    isError,
    isLoading,
    isSuccess,
    error,
    data: touches
    } = useGetTouchesQuery();
  const [ touch, touchResult ] = useTouchMutation();
  // const {} = touchResult;

  if (isError) {
    return (
      <div>
        <h1>There was an error: {error.toString()}</h1>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className={styles.container}>
        {touches}
      </div>
    );
  }

  return null;
};
