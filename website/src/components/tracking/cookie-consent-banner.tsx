'use client';

import { Button, Card, CardContent, Typography } from '@socialincome/ui';
import { ConsentStatusString } from 'firebase/analytics';
import { useEffect, useState } from 'react';

type CookieConsentBannerClientProps = {
	translations: {
		text: string;
		buttonAccept: string;
		buttonRefuse: string;
	};
};

export function CookieConsentBanner({ translations }: CookieConsentBannerClientProps) {
	const [hideBanner, setHideBanner] = useState(true);

	useEffect(() => {
		const cookieConsent = localStorage.getItem('cookie_consent');
		setHideBanner(Boolean(cookieConsent));
	}, [setHideBanner]);

	const setCookieConsent = (mode: ConsentStatusString) => {
		localStorage.setItem('cookie_consent', mode);
		location.reload();
	};
	if (hideBanner) return null;

	return (
		<Card className="fixed bottom-2 left-2 right-2 mx-auto max-w-6xl shadow-xl md:left-4 md:right-4">
			<CardContent className="flex flex-col space-y-2 p-4">
				<Typography className="md:col-span-3">
					<Typography as="span" dangerouslySetInnerHTML={{ __html: translations.text }} />
				</Typography>
				<div className="flex space-x-2">
					<Button variant="outline" onClick={() => setCookieConsent('granted')}>
						{translations.buttonAccept}
					</Button>
					<Button variant="destructive" onClick={() => setCookieConsent('denied')}>
						{translations.buttonRefuse}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
