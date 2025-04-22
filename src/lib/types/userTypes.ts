// ======== Users ========

export const USER_SHEET = 'users';

export type UserId = number;

export const USER_COLUMNS = ['userId', 'userName', 'hash', 'salt', 'touches', 'data', 'accountTypes'];

export interface UserColumns extends UserInfo, UserAuth, UserSession {};

export interface UserInfo extends UserIdentifiers {
	touches: number,
	data: string,
	accountTypes: string
};

/** Unique properties of a user */
export interface UserIdentifiers {
	userId: UserId,
	userName: string,
}

export interface UserAuth {
	hash: string,
	salt: string
}

export interface LoginInfo {
	userName: string,
	password: string
};


// ======== Metadata ========

export const METADATA_SHEET = 'metadata';
export const METADATA_DATA = ['key', 'value'];

const METADATA_KEYS = ['lastMetadataIndex', 'lastUserIndex', 'lastTokenIndex', 'lockId'] as const;
export type MetadataKey = typeof METADATA_KEYS[number];
export const METEDATA_INDEX_A1 = 'B2'; // Size of Metadata, hardcoded location

export interface Metadata {
	key: string,
	value: string | number
}


// ======== Tokens ========

export const TOKEN_SHEET = 'tokens';
export const TOKEN_COLUMNS = ['userId', 'token', 'tokenCreated'];
export interface UserSession extends UserToken {
	userId: UserId
}
export interface UserToken {
	token: string,
	tokenCreated: number
}
