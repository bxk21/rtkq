export type UserId = number;

export interface UserInfo {
	userId: UserId,
	userName: string,
	touches: number,
	data: string
};

export interface LoginInfo {
	userName: string,
	password: string
};
