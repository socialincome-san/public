export class RequestBodyTooLargeError extends Error {
	constructor() {
		super('Request body exceeds the maximum allowed size.');
		this.name = 'RequestBodyTooLargeError';
	}
}

const emptyArrayBuffer = (): ArrayBuffer => new ArrayBuffer(0);

/**
 * Reads the request body, enforcing a hard byte limit on the stream itself.
 * Content-Length is only used as a fast-path reject when present and oversized;
 * it is never trusted to allow unbounded buffering.
 */
export const readRequestBodyWithLimit = async (request: Request, maxBytes: number): Promise<ArrayBuffer> => {
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

	try {
		while (true) {
			const { done, value } = await reader.read();
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
