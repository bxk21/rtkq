// Need to use the React-specific entry point to import `createApi`
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface UserInfo {
  userName: string,
  touches: number,
  data: string
}

interface LoginInfo {
  userName: string,
  password: string
}

// Define a service using a base URL and expected endpoints
export const gSheetsApiSlice = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: "/api/gSheets" }),
  reducerPath: "gSheetsApi",
  // Tag types are used for caching and invalidation.
  tagTypes: ["Touch", "UserInfo"],
  endpoints: (build) => ({
    // TODO: Try Infinite Queries: https://redux-toolkit.js.org/rtk-query/usage/infinite-queries

    getTouches: build.query<number, void>({
      query: () => ({
        url: '/touch',
        method: 'POST',
        // header: cookies or sessionId or something
      }),
      providesTags: ['Touch'],
      transformResponse: (response: { data: number }, meta, arg) => response.data,
      transformErrorResponse: (response: { status: string | number }, meta, arg) => response.status,
    }),
    // Touches the "database" and increment the amount of touches.
    touch: build.mutation<number, void>({
      query: () => '/touch',
      invalidatesTags: ['Touch'],
      // https://redux-toolkit.js.org/rtk-query/usage/manual-cache-updates#optimistic-updates
      // // onQueryStarted is useful for optimistic updates
      // // The 2nd parameter is the destructured `MutationLifecycleApi`
      // async onQueryStarted(
      //   arg,
      //   { dispatch, getState, queryFulfilled, requestId, extra, getCacheEntry },
      // ) {},
      // // The 2nd parameter is the destructured `MutationCacheLifecycleApi`
      // async onCacheEntryAdded(
      //   arg,
      //   {
      //     dispatch,
      //     getState,
      //     extra,
      //     requestId,
      //     cacheEntryRemoved,
      //     cacheDataLoaded,
      //     getCacheEntry,
      //   },
      // ) {},
    }),

    login: build.query<UserInfo, LoginInfo> ({
      query: (loginInfo) => ({
        url: '/login',
        method: 'POST',
        body: loginInfo
      })
    }),
  }),
});

// Hooks are auto-generated by RTK-Query
// Same as `quotesApiSlice.endpoints.getQuotes.useQuery`
export const { useLoginQuery, useTouchMutation, useGetTouchesQuery } = gSheetsApiSlice;
