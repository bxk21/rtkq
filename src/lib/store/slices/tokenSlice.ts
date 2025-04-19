import type { AppThunk } from "@/src/lib/store/store";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { loginMatchFulfilled } from "./sheetsApiSlice";

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
		builder.addMatcher(
			loginMatchFulfilled,
			(state, { payload }) => {
				state.userId = payload.userId;
				state.token = payload.token;
				state.tokenCreated = payload.tokenCreated;
			},
		)
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
