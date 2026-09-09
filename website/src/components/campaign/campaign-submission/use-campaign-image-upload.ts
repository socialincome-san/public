'use client';

import { validateCampaignSubmissionImageMeta } from '@/lib/services/campaign/campaign-submission-input';
import { useCallback, useEffect, useRef, useState } from 'react';

type UseCampaignImageUploadOptions = {
	resolveError: (code: string) => string;
};

export const useCampaignImageUpload = ({ resolveError }: UseCampaignImageUploadOptions) => {
	const [file, setFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [focus, setFocus] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const previewUrlRef = useRef<string | null>(null);

	const revokePreview = useCallback(() => {
		if (previewUrlRef.current) {
			URL.revokeObjectURL(previewUrlRef.current);
			previewUrlRef.current = null;
		}
		setPreviewUrl(null);
	}, []);

	const clear = useCallback(() => {
		revokePreview();
		setFile(null);
		setFocus(null);
		setError(null);
		if (inputRef.current) {
			inputRef.current.value = '';
		}
	}, [revokePreview]);

	useEffect(() => {
		return () => {
			if (previewUrlRef.current) {
				URL.revokeObjectURL(previewUrlRef.current);
			}
		};
	}, []);

	const setFromFile = useCallback(
		(nextFile: File | null) => {
			if (!nextFile) {
				clear();

				return;
			}

			const metaError = validateCampaignSubmissionImageMeta(nextFile.size, nextFile.type);
			revokePreview();
			const objectUrl = URL.createObjectURL(nextFile);
			previewUrlRef.current = objectUrl;
			setPreviewUrl(objectUrl);
			setFile(nextFile);
			setFocus(null);
			setError(metaError ? resolveError(metaError) : null);
		},
		[clear, revokePreview, resolveError],
	);

	return {
		file,
		previewUrl,
		focus,
		error,
		inputRef,
		setFromFile,
		setFocus,
		clear,
		setError,
		onChange: setFromFile,
	};
};
