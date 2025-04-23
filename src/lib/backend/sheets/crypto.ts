import { UserAuth, UserToken } from '@/src/lib/types/userTypes';
import { randomBytes, pbkdf2Sync } from 'node:crypto';

const SIZE = 16;
const ITERATIONS = 10000;
const ENCODING = 'base64';
const DIGEST = 'sha512';
export const TOKEN_TIMEOUT = 3600000; // One Hour
export const TOKEN_EXPIRING = 3000000; // 50 Min

export function random(size?: number): string {
	return randomBytes(size ?? SIZE).toString(ENCODING);
}

export function generateSaltAndHash(password: string): UserAuth {
	const salt = random();
	const hash = pbkdf2Sync(password, salt, ITERATIONS, SIZE, DIGEST).toString(ENCODING);

	return {
		salt,
		hash
	};
}

export function checkPasswordAgainstSaltAndHash(password: string, salt: string, hash: string): boolean {
	return hash === pbkdf2Sync(password, salt, ITERATIONS, SIZE, DIGEST).toString(ENCODING);
}

export function generateToken(): UserToken {
	return {
		token: random(),
		tokenCreated: Date.now()
	}
}

export function isExpired(tokenCreated: number | string): boolean {
	return Date.now() - Number.parseInt(tokenCreated.toString()) > TOKEN_TIMEOUT;
};

export function isExpiring(tokenCreated: number | string): boolean {
	return (Date.now() - Number.parseInt(tokenCreated.toString())) > TOKEN_TIMEOUT;
};