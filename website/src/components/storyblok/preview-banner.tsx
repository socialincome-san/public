import { PreviewMessage } from '@/components/storyblok/preview-message';
import { draftMode } from 'next/headers';

export const PreviewBanner = async () => {
	const isPreview = (await draftMode()).isEnabled;

	return isPreview ? <PreviewMessage /> : null;
};
