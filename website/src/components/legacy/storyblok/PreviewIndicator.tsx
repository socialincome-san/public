import { PreviewMessage } from '@/components/legacy/storyblok/PreviewMessageAlert';
import { draftMode } from 'next/headers';

export const PreviewIndicator = async () => {
  const isPreview = (await draftMode()).isEnabled;

  return isPreview && <PreviewMessage />;
};
