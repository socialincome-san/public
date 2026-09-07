import {
	parseMultipartFormDataWithLimit,
	readRequestBodyWithLimit,
	RequestBodyTimeoutError,
	RequestBodyTooLargeError,
} from './request-body';

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
	const copy = new Uint8Array(bytes.byteLength);
	copy.set(bytes);

	return copy.buffer;
};

const createStreamRequest = (body: BodyInit, headers: HeadersInit = {}) =>
	new Request('http://localhost/test', {
		method: 'POST',
		headers,
		body,
		// Allow duplex streaming for slow ReadableStream bodies in Node's fetch Request.
		// @ts-expect-error duplex is required by undici for streaming request bodies
		duplex: 'half',
	});

describe('request-body', () => {
	describe('readRequestBodyWithLimit', () => {
		test('returns the full body when under the limit', async () => {
			const payload = toArrayBuffer(new TextEncoder().encode('hello world'));
			const request = createStreamRequest(payload);

			const result = await readRequestBodyWithLimit(request, 100);

			expect(new TextDecoder().decode(result)).toBe('hello world');
		});

		test('rejects based on oversized Content-Length without buffering the body', async () => {
			const payload = toArrayBuffer(new TextEncoder().encode('tiny'));
			const request = createStreamRequest(payload, { 'content-length': '9999' });

			await expect(readRequestBodyWithLimit(request, 10)).rejects.toBeInstanceOf(RequestBodyTooLargeError);
		});

		test('rejects when the stream exceeds the limit even if Content-Length is missing', async () => {
			const payload = toArrayBuffer(new Uint8Array(100));
			const request = createStreamRequest(payload);

			await expect(readRequestBodyWithLimit(request, 50)).rejects.toBeInstanceOf(RequestBodyTooLargeError);
		});

		test('rejects when Content-Length is understated but the body is oversized', async () => {
			const payload = toArrayBuffer(new Uint8Array(100));
			const request = createStreamRequest(payload, { 'content-length': '10' });

			await expect(readRequestBodyWithLimit(request, 50)).rejects.toBeInstanceOf(RequestBodyTooLargeError);
		});

		test('accepts an empty body', async () => {
			const request = new Request('http://localhost/test', { method: 'POST' });

			const result = await readRequestBodyWithLimit(request, 10);

			expect(result.byteLength).toBe(0);
		});

		test('aborts a never-ending stream after the read deadline', async () => {
			const hangingStream = new ReadableStream<Uint8Array>({
				start() {
					// Intentionally never enqueues or closes so the read stays pending.
				},
			});
			const request = createStreamRequest(hangingStream);

			await expect(readRequestBodyWithLimit(request, 100, 50)).rejects.toBeInstanceOf(RequestBodyTimeoutError);
		});
	});

	describe('parseMultipartFormDataWithLimit', () => {
		test('parses multipart fields under the size limit', async () => {
			const boundary = '----testboundary';
			const multipart = [
				`--${boundary}`,
				'Content-Disposition: form-data; name="title"',
				'',
				'My Campaign',
				`--${boundary}--`,
				'',
			].join('\r\n');
			const body = toArrayBuffer(new TextEncoder().encode(multipart));
			const request = createStreamRequest(body, {
				'content-type': `multipart/form-data; boundary=${boundary}`,
			});

			const formData = await parseMultipartFormDataWithLimit(request, 10_000);

			expect(formData.get('title')).toBe('My Campaign');
		});

		test('rejects oversized multipart bodies while reading', async () => {
			const boundary = '----testboundary';
			const largeValue = 'x'.repeat(200);
			const multipart = [
				`--${boundary}`,
				'Content-Disposition: form-data; name="title"',
				'',
				largeValue,
				`--${boundary}--`,
				'',
			].join('\r\n');
			const body = toArrayBuffer(new TextEncoder().encode(multipart));
			const request = createStreamRequest(body, {
				'content-type': `multipart/form-data; boundary=${boundary}`,
			});

			await expect(parseMultipartFormDataWithLimit(request, 50)).rejects.toBeInstanceOf(RequestBodyTooLargeError);
		});
	});
});
