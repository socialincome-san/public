'use client';

import type { WebsiteLanguage } from '@/lib/i18n/utils';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

type Props = {
	siteKey: string;
	language: WebsiteLanguage;
	onTokenChange: (token: string | null) => void;
};

export const TurnstileWidget = ({ siteKey, language, onTokenChange }: Props) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const onTokenChangeRef = useRef(onTokenChange);
	const [isApiReady, setIsApiReady] = useState(false);

	useEffect(() => {
		onTokenChangeRef.current = onTokenChange;
	}, [onTokenChange]);

	useEffect(() => {
		const api = window.turnstile;
		const container = containerRef.current;
		if (!siteKey || !isApiReady || !api || !container) {
			return;
		}

		const widgetId = api.render(container, {
			sitekey: siteKey,
			language: language === 'kri' ? 'en' : language,
			callback: (token) => {
				onTokenChangeRef.current(token);
			},
			'expired-callback': () => {
				onTokenChangeRef.current(null);
			},
			'error-callback': () => {
				onTokenChangeRef.current(null);
			},
		});

		return () => {
			onTokenChangeRef.current(null);
			api.remove(widgetId);
		};
	}, [isApiReady, language, siteKey]);

	if (!siteKey) {
		return null;
	}

	return (
		<>
			<Script
				id="cloudflare-turnstile"
				src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
				strategy="afterInteractive"
				onReady={() => setIsApiReady(true)}
			/>
			<div ref={containerRef} />
		</>
	);
};
