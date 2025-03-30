export type UserId = number;

/** Unique properties of a user */
export interface UserIdentifiers {
	userId: UserId,
	userName: string,
}

export interface UserInfo extends UserIdentifiers {
	touches: number,
	data: string
};

export interface UserColumns extends UserInfo, UserAuth, UserSession {};

export interface LoginInfo {
	userName: string,
	password: string
};

export interface UserSession extends UserToken {
	userId: UserId
}

export interface UserToken {
	token: string,
	tokenCreated: number
}

export interface UserAuth {
	hash: string,
	salt: string
}

export const USER_DATA = ['userId', 'userName', 'hash', 'salt', 'touches', 'data'];
export const TOKEN_DATA = ['userId', 'token', 'tokenCreated'];

export type UserAccount = { [K in (typeof USER_DATA)[number]]?: string };
