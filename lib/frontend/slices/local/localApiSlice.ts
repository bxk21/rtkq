import { LoginInfo, UserId, UserInfo } from "@/lib/def/user";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define a service using a base URL and expected endpoints
export const localApiSlice = createApi({
	baseQuery: fetchBaseQuery({ baseUrl: "/api/auth" }),
	reducerPath: "local",
	// Tag types are used for caching and invalidation.
	tagTypes: ["Touches", "UserInfo"],
	// // to prevent circular type issues, the return type needs to be annotated as any
	// extractRehydrationInfo(action, { reducerPath }): any {
	// 	if (isHydrateAction(action)) {
	// 		// when persisting the api reducer
	// 		if (action.key === 'key used with redux-persist') {
	// 			return action.payload;
	// 		}

	// 		// When persisting the root reducer
	// 		// return action.payload[api.reducerPath];
	// 	}
	// },
	endpoints: (build) => ({
		// How do I get other slice's mutations to invalidate my touches?
		// https://stackoverflow.com/questions/74655825/can-i-invalidate-an-rtk-query-from-a-different-slice-of-my-store
		getTouches: build.query<number, void>({
			query: () => ({
				url: '/touch',
				method: 'GET',
				// header: cookies or sessionId or something
			}),
			providesTags: ['Touches'],
			transformResponse: (response: { data: number }, meta, arg) => response.data,
			transformErrorResponse: (response: { status: string | number }, meta, arg) => response.status,
		}),

		touch: build.mutation<number, void>({
			query: () => ({
				url: '/touch',
				method: 'PATCH'
			}),
			invalidatesTags: ['Touches'],
		}),

		//FIXME: This runs automatically at load without a userId and errors.
		getUserInfo: build.query<UserInfo, UserId>({
			query: (userId) => `/user/${userId}`,
			providesTags: (result, error, userId) => {
				if (userId) {
					return [{ type: 'UserInfo', id: userId }];
				} else { // If checking own userInfo
					return [{ type: 'UserInfo', id: -2 }];
				}
			},
			transformResponse: (response: { data: UserInfo }, meta, arg) => response?.data,
		}),

		login: build.mutation<UserId, LoginInfo> ({
			query: (loginInfo) => ({
				url: '/login',
				method: 'POST',
				body: loginInfo
			}),
			invalidatesTags: ['Touches', 'UserInfo'],
			// transformResponse: (response: { data: UserId }) => response.data
		}),
	}),
});

export const { useLoginMutation, useGetUserInfoQuery, useTouchMutation, useGetTouchesQuery } = localApiSlice;

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
