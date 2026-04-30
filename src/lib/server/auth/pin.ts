import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const SCRYPT_KEY_LENGTH = 64;

export async function hashPin(pin: string) {
	const salt = randomBytes(16).toString('hex');
	const derivedKey = (await scrypt(pin, salt, SCRYPT_KEY_LENGTH)) as Buffer;

	return `${salt}:${Buffer.from(derivedKey).toString('hex')}`;
}

export async function verifyPin(pin: string, pinHash: string) {
	const [salt, storedHash] = pinHash.split(':');

	if (!salt || !storedHash) {
		return false;
	}

	const derivedKey = (await scrypt(pin, salt, SCRYPT_KEY_LENGTH)) as Buffer;
	const storedBuffer = Buffer.from(storedHash, 'hex');
	const derivedBuffer = Buffer.from(derivedKey);

	if (storedBuffer.length !== derivedBuffer.length) {
		return false;
	}

	return timingSafeEqual(storedBuffer, derivedBuffer);
}
