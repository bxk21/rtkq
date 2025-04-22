export const ACCOUNT_TYPES = ['user', 'admin', 'superAdmin'] as const;
export type AccountType = typeof ACCOUNT_TYPES[number];

export const ACCESS_TYPES = ['readSelf', 'editSelf', 'readUsers', 'editUsers', 'readAdmins', 'editAdmins'] as const
export type Access = typeof ACCESS_TYPES[number];

const T = true, F = false;

export const ACCESS_MATRIX: {[Key in AccountType]: {[Key in Access]: boolean}} = {
	      user: { readSelf: T, editSelf: T, readUsers: F, editUsers: F, readAdmins: F, editAdmins: F },
	     admin: { readSelf: T, editSelf: T, readUsers: T, editUsers: T, readAdmins: F, editAdmins: F },
	superAdmin: { readSelf: T, editSelf: T, readUsers: T, editUsers: T, readAdmins: T, editAdmins: T }
};

export function getAccountTypes(accountTypes: string): AccountType[] {
	return accountTypes.split(',') as AccountType[];
}

export function hasAccountType(accountTypes: AccountType[] | string, accountType: AccountType): boolean {
	const types = typeof accountTypes === 'string' ? getAccountTypes(accountTypes) : accountTypes;
	return types.some((type) => type === accountType);
}

export function hasPermissions(accountTypes: AccountType[], access: Access): boolean {
	return accountTypes.some((accountType) => ACCESS_MATRIX[accountType][access]);
}
