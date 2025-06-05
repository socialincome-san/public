export async function GET(request: Request) {
	const headers = Object.fromEntries(request.headers.entries());
	return new Response(JSON.stringify(headers, null, 2), {
		headers: { 'Content-Type': 'application/json' },
	});
}
