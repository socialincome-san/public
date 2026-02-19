'use client';

import { useIsPage } from '@/lib/hooks/useIsPage';
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

export const CookieConsentBanner = ({ translations }: CookieConsentBannerClientProps) => {
  const isSurveyPage = useIsPage('survey');
  const [hideBanner, setHideBanner] = useState(true);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookie_consent');
    setHideBanner(Boolean(cookieConsent) || isSurveyPage);
  }, [isSurveyPage, setHideBanner]);

  const setCookieConsent = (mode: ConsentStatusString) => {
    localStorage.setItem('cookie_consent', mode);
    location.reload();
  };
  if (hideBanner) {
    return null;
  }

  return (
    <Card className="fixed bottom-2 right-2 mx-auto w-fit max-w-6xl rounded-full border-border bg-background px-4 md:right-4">
      <CardContent className="flex flex-col space-y-2 p-4 md:h-full md:flex-row md:items-center md:justify-between">
        <Typography className="md:col-span-3 md:mr-4 md:flex-1 md:self-center">
          <Typography as="span" dangerouslySetInnerHTML={{ __html: translations.text }} />
        </Typography>
        <div className="flex space-x-2 pb-1 md:h-full md:flex-none md:flex-row md:items-center md:justify-center md:self-center md:align-middle">
          <Button variant="outline" onClick={() => setCookieConsent('denied')}>
            {translations.buttonRefuse}
          </Button>
          <Button variant="outline" onClick={() => setCookieConsent('granted')}>
            {translations.buttonAccept}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
