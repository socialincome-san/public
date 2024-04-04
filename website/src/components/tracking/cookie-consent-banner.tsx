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
		<div className="fixed top-4 w-full pl-4 pr-4 md:bottom-4 md:top-auto md:max-w-sm md:px-4 lg:px-4">
			<Card className="w-full">
				<CardContent className="flex flex-col items-center gap-2 space-y-2 p-4">
					<Typography>
						<Typography as="span" dangerouslySetInnerHTML={{ __html: translations.text }} />
					</Typography>
					<div className="flex flex-wrap justify-center gap-2">
						<Button
							variant="outline"
							onClick={() => setCookieConsent('denied')}
							className="border-primary text-primary hover:bg-primary rounded-full border bg-transparent px-12 hover:text-white"
						>
							{translations.buttonRefuse}
						</Button>
						<Button
							variant="default"
							onClick={() => setCookieConsent('granted')}
							className="text-popover hover:bg-primary rounded-full border px-12 hover:text-white"
						>
							{translations.buttonAccept}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
