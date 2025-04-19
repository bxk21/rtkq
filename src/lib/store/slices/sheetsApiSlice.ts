import { RootState } from "@/src/lib/store/store";
import { LoginInfo, UserId, UserInfo, UserSession } from "@/src/lib/types/userTypes";
import { createApi, fetchBaseQuery, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { selectUserId } from "./tokenSlice";

// Define a service using a base URL and expected endpoints
export const sheetsApiSlice = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: "/api/auth",
		// Add Token to every header
		prepareHeaders: (headers, api) => {
			const state = api.getState() as RootState;
			console.log('state', state);

			const token = state.token.token;
			if (token) {
				headers.set('token', token);
			}
			return headers;
		},
		// Update Token from every response
		// responseHandler: async (response) => {
		// 	const token = response.headers.get('token');
		// 	// null will turn into 0, which will then turn back into null;
		// 	const tokenCreated = parseInt(response.headers.get('tokenCreated') ?? '0') || null;

		// 	// Update Token
		// 	setToken({ // TODO: send to store
		// 		token,
		// 		tokenCreated
		// 	});

		// 	return response;
		// },
	}),
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
			transformResponse: (response: { data: number }, _meta, _arg) => response.data,
			transformErrorResponse: (response: { status: string | number }, _meta, _arg) => response.status,
		}),

		touch: build.mutation<number, void>({
			query: () => ({
				url: '/touch',
				method: 'PATCH'
			}),
			invalidatesTags: ['Touches'],
		}),

		getUserInfo: build.query<UserInfo, UserId>({
			// queryFn: async (_args, api, _extraOptions, baseQuery) => {
			// 	const state = api.getState() as RootState;
			// 	console.log('state', state);
			// 	const userId = selectUserId(state);
			// 	if (!userId) {
			// 		api.abort('Not Logged In');
			// 	}
			// 	try {
			// 		const result = await baseQuery({
			// 			url: `/user/${userId}`,
			// 		});

			// 		if (result.error) { return result }

			// 		return {
			// 			data: result.data as UserInfo,
			// 			meta: result.meta
			// 		};
			// 	} catch (error) {
			// 		return { error: error as FetchBaseQueryError };
			// 	}
			// },
			query: (userId) => `/user/${userId}`,
			// providesTags: (_result, _error, userId) => {
			// 	return [{ type: 'UserInfo', id: userId ?? -2 }];
			// },
			providesTags: ['UserInfo'],
			transformResponse: (response: { data: UserInfo }, _meta: any, _arg: any) => response?.data,
		}),

		login: build.mutation<UserSession, LoginInfo> ({
			query: (loginInfo) => ({
				url: '/login',
				method: 'POST',
				body: loginInfo
			}),
			invalidatesTags: ['Touches', 'UserInfo'],
			// transformResponse: (response: { data: UserId }) => response.data
		}),

		newUser: build.mutation<UserSession, LoginInfo> ({
			query: (loginInfo) => ({
				url: '/login',
				method: 'PUT',
				body: loginInfo
			}),
			invalidatesTags: ['Touches', 'UserInfo'],
			// transformResponse: (response: { data: UserId }) => response.data
		}),
	}),
});

export const { useLoginMutation, useGetUserInfoQuery, useTouchMutation, useGetTouchesQuery, useNewUserMutation,
	endpoints: {
		login: {
			matchFulfilled: loginMatchFulfilled
		}
	}
} = sheetsApiSlice;

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
