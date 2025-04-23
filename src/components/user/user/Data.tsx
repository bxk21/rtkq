'use client';

import { selectUserId } from "@/src/lib/store/slices/tokenSlice";
import { useSelector } from "react-redux";
import { redirect } from "next/navigation";
import { useGetUserInfoQuery, usePatchUserInfoMutation } from "@/src/lib/store/slices/sheetsApiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect } from "react";

export default function Data() {
	const userId = useSelector(selectUserId);
	const {
		data,
		isLoading: isLoadingData,
		isSuccess: isDataSuccess,
		isError: isDataError,
		error: dataError
	} = useGetUserInfoQuery(userId ?? skipToken);
	const [ patchUserInfo, { isLoading: isPatching } ] = usePatchUserInfoMutation();

	function submitUserInfo(formData: FormData) {
		patchUserInfo({
			userId: userId!,
			data: formData.get('data') as string
		});
	}

	useEffect(() => {
		if (!userId) {
			redirect('/login');
		}
	}, [userId]);

	return <div>
		{isLoadingData && <div>
			Loading...
		</div>}

		{isDataError && <div>
			<h1>There was an error: {JSON.stringify(dataError)}</h1>
		</div>}

		{isDataSuccess && <form action={submitUserInfo}>
			<label> Data: </label>
			<textarea rows={20} cols={200} id='data' name='data' defaultValue={data?.data} disabled={isPatching}/>
			{!isPatching && <button type="submit">
				Save
			</button>}
		</form>}
	</div>
}
