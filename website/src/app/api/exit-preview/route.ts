import { draftMode } from 'next/headers';

/**
 *
 * Disables the preview-mode enabled by {@link /website/src/app/api/preview}
 */
export const GET = async () => {
	const draft = await draftMode();
	draft.disable();
	return new Response('Preview is disabled');
};
