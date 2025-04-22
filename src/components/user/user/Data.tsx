'use client';

import { selectUserId } from "@/src/lib/store/slices/tokenSlice";
import { useSelector } from "react-redux";
import { redirect } from "next/navigation";
import { useGetUserInfoQuery, usePatchUserInfoMutation } from "@/src/lib/store/slices/sheetsApiSlice";
import { skipToken } from "@reduxjs/toolkit/query";

export default function Data() {
	const userId = useSelector(selectUserId);
	const { data } = useGetUserInfoQuery(userId ?? skipToken);
	const [ patchUserInfo, { isError, error, reset, isLoading, isUninitialized, isSuccess } ] = usePatchUserInfoMutation();

	function submitUserInfo(formData: FormData) {
		// console.log('form', formData.entries().toArray(), formData.get('data'));
		patchUserInfo({
			userId: userId!,
			data: formData.get('data') as string
		});
	}

	if (!data) { redirect('/login'); }

	return <div>
		<form action={submitUserInfo}>
			<label>
				Data: <textarea id='data' name='data' defaultValue={data.data}/>
			</label>
			{!isLoading && <button type="submit">
				Save
			</button>}
		</form>
	</div>
}
