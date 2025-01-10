import { draftMode } from 'next/headers';

export async function GET() {
	const draft = draftMode();
	draft.disable();
	return new Response('Preview is disabled');
}
