'use client';

import { updateStoryblokPreviewAction } from '@/lib/server-actions/storyblok-preview-actions';
import { registerStoryblokBridge } from '@/lib/storyblok-preview/register-bridge';
import type { ISbStoryData } from '@storyblok/js';
import { loadStoryblokBridge } from '@storyblok/js';
import { startTransition, useEffect } from 'react';

type Props = {
	previewToken: string;
	previewRoutePath: string;
};

export const StoryblokPreviewSyncer = ({ previewToken, previewRoutePath }: Props) => {
	useEffect(() => {
		if (!previewToken || !previewRoutePath) {
			return;
		}

		const handleInput = (story: ISbStoryData) => {
			startTransition(() => {
				void updateStoryblokPreviewAction({
					story,
					previewToken,
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
	}, [previewRoutePath, previewToken]);

	return null;
};
