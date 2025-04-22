import { UserAuth, UserToken } from '@/src/lib/types/userTypes';
import { randomBytes, pbkdf2Sync } from 'node:crypto';

const SIZE = 16;
const ITERATIONS = 10000;
const ENCODING = 'base64';
const DIGEST = 'sha512';
export const TOKEN_TIMEOUT = 60000; // One Hour // TODO wrong unit?

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

export function isExpired(tokenCreated: number): boolean {
	return (Date.now() - tokenCreated) > TOKEN_TIMEOUT;
};
