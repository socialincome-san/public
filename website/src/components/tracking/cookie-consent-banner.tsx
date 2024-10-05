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
		<Card className="fixed bottom-2 right-2 mx-auto max-w-6xl md:right-4 bg-white w-fit rounded-full px-4 border-white">
			<CardContent className="flex flex-col space-y-2 p-4 md:flex-row md:items-center md:justify-between md:h-full">
				<Typography className="md:col-span-3 md:flex-1 md:self-center md:mr-4">
					<Typography as="span" dangerouslySetInnerHTML={{ __html: translations.text }} />
				</Typography>
				<div className="pb-1 flex space-x-2 md:flex-none md:self-center md:items-center md:h-full md:justify-center md:flex-row md:align-middle">
					<Button variant="outline" className="border-primary text-primary bg-transparent md:self-center" onClick={() => setCookieConsent('denied')}>
						{translations.buttonRefuse}
					</Button>
					<Button variant="outline" className="border-primary text-primary bg-transparent md:self-center" onClick={() => setCookieConsent('granted')}>
						{translations.buttonAccept}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
