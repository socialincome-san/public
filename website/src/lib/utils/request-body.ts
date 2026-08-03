export class RequestBodyTooLargeError extends Error {
	constructor() {
		super('Request body exceeds the maximum allowed size.');
		this.name = 'RequestBodyTooLargeError';
	}
}

export class RequestBodyTimeoutError extends Error {
	constructor() {
		super('Request body read timed out.');
		this.name = 'RequestBodyTimeoutError';
	}
}

/** Overall deadline for draining the request body stream. */
export const DEFAULT_REQUEST_BODY_READ_TIMEOUT_MS = 30_000;

const emptyArrayBuffer = (): ArrayBuffer => new ArrayBuffer(0);

const readChunkWithDeadline = async (
	reader: ReadableStreamDefaultReader<Uint8Array>,
	remainingMs: number,
): Promise<ReadableStreamReadResult<Uint8Array>> => {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;
	try {
		return await Promise.race([
			reader.read(),
			new Promise<never>((_, reject) => {
				timeoutId = setTimeout(() => {
					reject(new RequestBodyTimeoutError());
				}, remainingMs);
			}),
		]);
	} finally {
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
		}
	}
};

/**
 * Reads the request body, enforcing a hard byte limit on the stream itself.
 * Content-Length is only used as a fast-path reject when present and oversized;
 * it is never trusted to allow unbounded buffering.
 * The overall read is also bound by a fixed deadline to abort stalling clients.
 */
export const readRequestBodyWithLimit = async (
	request: Request,
	maxBytes: number,
	timeoutMs: number = DEFAULT_REQUEST_BODY_READ_TIMEOUT_MS,
): Promise<ArrayBuffer> => {
	const contentLengthHeader = request.headers.get('content-length');
	if (contentLengthHeader !== null) {
		const contentLength = Number(contentLengthHeader);
		if (Number.isFinite(contentLength) && contentLength > maxBytes) {
			throw new RequestBodyTooLargeError();
		}
	}

	const body = request.body;
	if (!body) {
		return emptyArrayBuffer();
	}

	const reader = body.getReader();
	const chunks: Uint8Array[] = [];
	let totalBytes = 0;
	const deadline = Date.now() + timeoutMs;

	try {
		while (true) {
			const remainingMs = deadline - Date.now();
			if (remainingMs <= 0) {
				await reader.cancel();
				throw new RequestBodyTimeoutError();
			}

			let chunk: ReadableStreamReadResult<Uint8Array>;
			try {
				chunk = await readChunkWithDeadline(reader, remainingMs);
			} catch (error) {
				if (error instanceof RequestBodyTimeoutError) {
					await reader.cancel();
				}
				throw error;
			}

			const { done, value } = chunk;
			if (done) {
				break;
			}

			totalBytes += value.byteLength;
			if (totalBytes > maxBytes) {
				await reader.cancel();
				throw new RequestBodyTooLargeError();
			}

			chunks.push(value);
		}
	} finally {
		try {
			reader.releaseLock();
		} catch {
			// Stream may already be cancelled or released.
		}
	}

	const result = new Uint8Array(totalBytes);
	let offset = 0;
	for (const chunk of chunks) {
		result.set(chunk, offset);
		offset += chunk.byteLength;
	}

	return result.buffer;
};

export const parseMultipartFormDataWithLimit = async (request: Request, maxBytes: number): Promise<FormData> => {
	const body = await readRequestBodyWithLimit(request, maxBytes);
	const contentType = request.headers.get('content-type');
	if (!contentType?.toLowerCase().includes('multipart/form-data')) {
		throw new TypeError('Expected multipart/form-data content type.');
	}

	return new Response(body, {
		headers: { 'content-type': contentType },
	}).formData();
};
