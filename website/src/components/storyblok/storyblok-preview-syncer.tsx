'use client';

import { updateStoryblokPreviewAction } from '@/lib/server-actions/storyblok-preview-actions';
import { registerStoryblokBridge } from '@/lib/storyblok-preview/register-bridge';
import type { ISbStoryData } from '@storyblok/js';
import { loadStoryblokBridge } from '@storyblok/js';
import { startTransition, useEffect } from 'react';

type Props = {
	previewToken: string;
	previewTimestamp: string;
	previewRoutePath: string;
};

export const StoryblokPreviewSyncer = ({ previewToken, previewTimestamp, previewRoutePath }: Props) => {
	useEffect(() => {
		if (!previewToken || !previewTimestamp || !previewRoutePath) {
			return;
		}

		const handleInput = (story: ISbStoryData) => {
			startTransition(() => {
				void updateStoryblokPreviewAction({
					story,
					previewToken,
					previewTimestamp,
					previewRoutePath,
				});
			});
		};

		let isMounted = true;
		(async () => {
			await loadStoryblokBridge();
			if (!isMounted) {
				return;
			}
			registerStoryblokBridge({
				onInput: handleInput,
			});
		})();
		return () => {
			isMounted = false;
		};
	}, [previewRoutePath, previewTimestamp, previewToken]);

	return null;
};
