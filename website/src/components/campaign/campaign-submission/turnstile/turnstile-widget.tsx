'use client';

import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { useEffect, useRef } from 'react';
import type { TurnstileApi } from './turnstile';

type Props = {
	siteKey: string;
	language: WebsiteLanguage;
	onTokenChange: (token: string | null) => void;
};

const POLL_INTERVAL_MS = 50;

const waitForTurnstileApi = (isCancelled: () => boolean) =>
	new Promise<TurnstileApi | null>((resolve) => {
		if (isCancelled()) {
			resolve(null);

			return;
		}

		if (window.turnstile) {
			resolve(window.turnstile);

			return;
		}

		const intervalId = window.setInterval(() => {
			if (isCancelled()) {
				window.clearInterval(intervalId);
				resolve(null);

				return;
			}

			if (window.turnstile) {
				window.clearInterval(intervalId);
				resolve(window.turnstile);
			}
		}, POLL_INTERVAL_MS);
	});

export const TurnstileWidget = ({ siteKey, language, onTokenChange }: Props) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const onTokenChangeRef = useRef(onTokenChange);

	useEffect(() => {
		onTokenChangeRef.current = onTokenChange;
	}, [onTokenChange]);

	useEffect(() => {
		if (!siteKey) {
			return;
		}

		let cancelled = false;
		let widgetId: string | undefined;
		let turnstileApi: TurnstileApi | undefined;

		const renderWidget = async () => {
			const api = await waitForTurnstileApi(() => cancelled);
			const container = containerRef.current;
			if (!api || !container || cancelled) {
				return;
			}

			turnstileApi = api;
			widgetId = api.render(container, {
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

			if (cancelled) {
				api.remove(widgetId);
			}
		};

		void renderWidget();

		return () => {
			cancelled = true;
			onTokenChangeRef.current(null);
			if (widgetId && turnstileApi) {
				turnstileApi.remove(widgetId);
			}
		};
	}, [language, siteKey]);

	if (!siteKey) {
		return null;
	}

	return <div ref={containerRef} />;
};
