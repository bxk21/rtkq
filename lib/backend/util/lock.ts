import { HttpStatusCode } from "axios";
import { NextResponse } from "next/server";

var locked = false;
const queue: ((...args: any[]) => void)[] = [];

function acquire(): Promise<boolean | void> {
	if (!locked) { // lock and immediately resolve, starting the callback, but don't queue up.
		locked = true;
		return Promise.resolve(true);
	} else if (queue.length > 1) {
		return Promise.resolve(false); // No more than one action in the queue
	} else { // if locked, return a promise that resolves when called in the queue
		return new Promise<boolean>((resolve, _reject) => {
			queue.push(resolve);
		});
	}

}

/**
 * Called when a particular promise in the queue is resolved, allowing the callback to be run then released.
 */
function release(): void {
	if (queue.length > 0) { // if there's a next promise, resolve that one
		console.log('PROCESSING NEXT IN QUEUE');
		const next = queue.shift()!;
		next(true);
	} else {
		console.log('LOCK DONE');
		locked = false;
	}
}

/**
 * Waits for acquire, (either immediately or when it's its turn in the queue)
 * Runs the callback,
 * Releases the lock or calls the next item in the queue,
 * Returns the callback value.
 */
export async function withLock<T>(callback: () => Promise<T>, id: string): Promise<T | NextResponse> {
	console.log('QUEUE', id);
	return acquire().then(async (allow) => {
		if (!allow) {
			console.log('QUEUE TOO LONG', id, queue);
			return NextResponse.json(null, {status: HttpStatusCode.ServiceUnavailable});
		}
		try {
			console.log('MY TURN', id);
			return await callback();
		} finally {
			console.log('DONE', id);
			release();
		}
	});
}