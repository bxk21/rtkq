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

export interface Metadata {
	key: string,
	value: string | number
}

export const USER_SHEET = 'users';
export const USER_DATA = ['userId', 'userName', 'hash', 'salt', 'touches', 'data'];
// export type UserAccount = { [K in (typeof USER_DATA)[number]]?: string };

export const METADATA_SHEET = 'metadata';
export const METADATA_DATA = ['key', 'value'];
const METADATA_KEYS = ['lastMetadataIndex', 'lastUserIndex', 'lastTokenIndex', 'lockId'] as const;
export type MetadataKey = typeof METADATA_KEYS[number];
export const METEDATA_INDEX_A1 = 'B2'; // Size of Metadata, hardcoded location

export const TOKEN_SHEET = 'tokens';
export const TOKEN_DATA = ['userId', 'token', 'tokenCreated'];

