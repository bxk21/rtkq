export type FlatTwoDimentionalArray<A> = [
	A[]
];

export type RequireOneMinimum<T, Keys extends keyof T = keyof T> =
	Pick<T, Exclude<keyof T, Keys>> 
	& {
		[K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
	}[Keys];

export type RequireOneExactly<T, Keys extends keyof T = keyof T> =
	Pick<T, Exclude<keyof T, Keys>>
	& {
		[K in Keys]-?:
			Required<Pick<T, K>>
			& Partial<Record<Exclude<Keys, K>, undefined>>
	}[Keys];