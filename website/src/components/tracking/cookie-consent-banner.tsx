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
		<div className="fixed top-4 pr-4 pl-4 md:bottom-4 md:top-auto md:px-4 lg:px-4 w-full md:max-w-sm">
			<Card className="w-full">
				<CardContent className="flex flex-col space-y-2 p-4 gap-2 items-center">
					<Typography>
						<Typography as="span" dangerouslySetInnerHTML={{ __html: translations.text }} />
					</Typography>
					<div className="flex flex-wrap justify-center gap-2">
						<Button variant="outline" onClick={() => setCookieConsent('denied')}
										className="border border-primary bg-transparent rounded-full px-12 text-primary hover:bg-primary hover:text-white">
							{translations.buttonRefuse}
						</Button>
						<Button variant="default" onClick={() => setCookieConsent('granted')}
										className="border rounded-full px-12 text-popover hover:bg-primary hover:text-white">
							{translations.buttonAccept}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
