'use client';

import { updateStoryblokPreviewAction } from '@/lib/server-actions/storyblok-preview-actions';
import { registerStoryblokBridge } from '@/lib/storyblok-preview/register-bridge';
import type { ISbStoryData } from '@storyblok/js';
import { loadStoryblokBridge } from '@storyblok/js';
import { startTransition, useEffect, useRef } from 'react';

type Props = {
	previewToken: string;
	previewTimestamp: string;
	previewRoutePath: string;
};

export const StoryblokPreviewSyncer = ({ previewToken, previewTimestamp, previewRoutePath }: Props) => {
	const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (!previewToken || !previewTimestamp || !previewRoutePath) {
			return;
		}

		const handleInput = (story: ISbStoryData) => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}

			debounceTimerRef.current = setTimeout(() => {
				startTransition(() => {
					void updateStoryblokPreviewAction({
						story,
						previewToken,
						previewTimestamp,
						previewRoutePath,
					});
				});
			}, 300);
		};

		let isMounted = true;
		void (async () => {
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
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
				debounceTimerRef.current = null;
			}
		};
	}, [previewRoutePath, previewTimestamp, previewToken]);

	return null;
};
