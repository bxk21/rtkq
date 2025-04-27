import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import { allFulfilledMatches } from "./sheetsApiSlice";
import { BaseQueryFn, BaseQueryMeta } from "@reduxjs/toolkit/query";
import { toInt } from "@/src/lib/util/string";

export interface TokenState {
	userId: number | null;
	token: string | null;
	tokenCreated: number | null;
}

const initialState: TokenState = {
	userId: null,
	token: null,
	tokenCreated: null,
};

export type Meta = BaseQueryMeta<BaseQueryFn<any, unknown, unknown, {}, { response: Response }>>

// If you are not using async thunks you can use the standalone `createSlice`.
export const tokenSlice = createSlice({
	name: "token",
	// `createSlice` will infer the state type from the `initialState` argument
	initialState,
	// The `reducers` field lets us define reducers and generate associated actions
	reducers: {
		// setToken(state, action: PayloadAction<TokenState>) {
		// 	state = action.payload;
		// 	// state.token = action.payload.token;
		// }
	},
	extraReducers: (builder) => {
		builder.addMatcher( // Get Token Data from all Headers
			isAnyOf(...allFulfilledMatches),
			(state, { meta: { baseQueryMeta } }) => {
				const headers = (baseQueryMeta as Meta)!.response.headers;
				state.userId = toInt(headers.get('userId'));
				state.token = headers.get('token');
				state.tokenCreated = toInt(headers.get('tokenCreated'));
			},
		);
		// TODO: Remove Token/Login Data on NOT LOGGED IN failure
	},
	selectors: {
		selectUserId: (counter) => counter.userId,
		selectToken: (counter) => counter.token,
		selectTokenCreated: (counter) => counter.tokenCreated,
	},
});

// Action creators are generated for each case reducer function.
// export const { } = tokenSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectUserId, selectToken, selectTokenCreated } = tokenSlice.selectors;
