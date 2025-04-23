import { RootState } from "@/src/lib/store/store";
import { LoginInfo, UserId, UserInfo } from "@/src/lib/types/userTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * The API Slice for everything within the Sheets Database
 */
export const sheetsApiSlice = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: "/api/sheets",
		prepareHeaders: (headers, api) => { // Add Token to every header
			const state = api.getState() as RootState;

			const token = state.token.token;
			if (token) {
				headers.set('token', token);
			}
			const userId = state.token.userId;
			if (userId) {
				headers.set('userId', userId.toString());
			}
			return headers;
		},
	}),
	reducerPath: "local",
	tagTypes: ["Touches", "UserInfo"], // Tag types are used for caching and invalidation.
	endpoints: (build) => ({
		// How do I get other slice's mutations to invalidate my touches?
		// https://stackoverflow.com/questions/74655825/can-i-invalidate-an-rtk-query-from-a-different-slice-of-my-store
		// getTouches: build.query<number, void>({
		// 	query: () => ({
		// 		url: '/touch',
		// 		method: 'GET',
		// 	}),
		// 	providesTags: ['Touches'],
		// 	transformResponse: (response: { data: number }, _meta, _arg) => response.data,
		// 	transformErrorResponse: (response: { status: string | number }, _meta, _arg) => response.status,
		// }),

		// touch: build.mutation<number, void>({
		// 	query: () => ({
		// 		url: '/touch',
		// 		method: 'PATCH'
		// 	}),
		// 	invalidatesTags: ['Touches'],
		// }),

		getUserInfo: build.query<Partial<UserInfo>, UserId>({
			query: (userId) => `/user/${userId}`,
			providesTags: ['UserInfo'],
		}),

		patchUserInfo: build.mutation<boolean, Partial<UserInfo>>({
			query: ({userId, ...data}, ) => ({
				url: `/user/${userId}`,
				method: 'PATCH',
				body: data
			}),
			invalidatesTags: ['UserInfo']
		}),

		login: build.mutation<boolean, LoginInfo> ({
			query: (loginInfo) => ({
				url: '/login',
				method: 'POST',
				body: loginInfo
			}),
			invalidatesTags: ['Touches', 'UserInfo'],
		}),

		newUser: build.mutation<boolean, LoginInfo> ({
			query: (loginInfo) => ({
				url: '/login',
				method: 'PUT',
				body: loginInfo
			}),
			invalidatesTags: ['Touches', 'UserInfo'],
		}),
	}),
});

export const { useLoginMutation, useGetUserInfoQuery, usePatchUserInfoMutation, useNewUserMutation, endpoints } = sheetsApiSlice;

export const allFulfilledMatches = Object.values(endpoints).map((endpoint) => endpoint.matchFulfilled);
		// https://redux-toolkit.js.org/rtk-query/usage/manual-cache-updates#optimistic-updates
		// // onQueryStarted is useful for optimistic updates
		// // The 2nd parameter is the destructured `MutationLifecycleApi`
		// async onQueryStarted(
		// 	arg,
		// 	{ dispatch, getState, queryFulfilled, requestId, extra, getCacheEntry },
		// ) {},
		// // The 2nd parameter is the destructured `MutationCacheLifecycleApi`
		// async onCacheEntryAdded(
		// 	arg,
		// 	{
		// 		dispatch,
		// 		getState,
		// 		extra,
		// 		requestId,
		// 		cacheEntryRemoved,
		// 		cacheDataLoaded,
		// 		getCacheEntry,
		// 	},
		// ) {},
