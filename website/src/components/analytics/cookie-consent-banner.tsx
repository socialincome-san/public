'use client';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { useIsPage } from '@/lib/hooks/useIsPage';
import type { ConsentStatusString } from 'firebase/analytics';
import { useEffect, useState } from 'react';

type CookieConsentBannerProps = {
	translations: {
		text: string;
		buttonAccept: string;
		buttonRefuse: string;
	};
};

export const CookieConsentBanner = ({ translations }: CookieConsentBannerProps) => {
	const isSurveyPage = useIsPage('survey');
	const [hideBanner, setHideBanner] = useState(true);

	useEffect(() => {
		const cookieConsent = localStorage.getItem('cookie_consent');
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setHideBanner(Boolean(cookieConsent) || isSurveyPage);
	}, [isSurveyPage]);

	const setCookieConsent = (mode: ConsentStatusString) => {
		localStorage.setItem('cookie_consent', mode);
		window.location.reload();
	};

	if (hideBanner) {
		return null;
	}

	return (
		<Card
			variant="noPadding"
			className="border-border fixed right-2 bottom-2 z-50 mx-auto w-fit max-w-6xl rounded-full border px-4 md:right-4"
		>
			<div className="flex flex-col space-y-2 p-4 md:h-full md:flex-row md:items-center md:justify-between">
				<p className="text-foreground md:mr-4 md:flex-1 md:self-center">
					<span dangerouslySetInnerHTML={{ __html: translations.text }} />
				</p>
				<div className="flex space-x-2 pb-1 md:h-full md:flex-none md:flex-row md:items-center md:justify-center md:self-center md:align-middle">
					<Button type="button" variant="outline" onClick={() => setCookieConsent('denied')}>
						{translations.buttonRefuse}
					</Button>
					<Button type="button" variant="outline" onClick={() => setCookieConsent('granted')}>
						{translations.buttonAccept}
					</Button>
				</div>
			</div>
		</Card>
	);
};
