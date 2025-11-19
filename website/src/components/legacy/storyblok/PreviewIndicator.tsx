import { PreviewMessage } from '@/components/legacy/storyblok/PreviewMessageAlert';
import { draftMode } from 'next/headers';

export async function PreviewIndicator() {
	let isPreview = (await draftMode()).isEnabled;
	return isPreview && <PreviewMessage />;
}
