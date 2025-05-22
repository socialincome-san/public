import { draftMode } from 'next/headers';

/**
 *
 * Disables the preview-mode enabled by {@link /website/src/app/api/preview}
 */
export async function GET() {
	const draft = await draftMode();
	draft.disable();
	return new Response('Preview is disabled');
}
