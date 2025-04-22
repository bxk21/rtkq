/**
 * Parses a string to an integer, maintaining nulls.
 */
export function toInt(str: string | null): number | null {
	return Number.parseInt(str ?? '') || null;
}
