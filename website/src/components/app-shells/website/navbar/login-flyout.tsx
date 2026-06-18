'use client';

import { Button } from '@/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { MagicLinkLoginForm } from '@/components/login/magic-link-login-form';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { UserRound } from 'lucide-react';
import { useState } from 'react';

type Props = {
	lang: WebsiteLanguage;
};

export const LoginFlyout = ({ lang }: Props) => {
	const translator = useTranslator(lang, 'website-login');

	const [open, setOpen] = useState(false);

	return (
		<>
			<Button data-testid="login-button" onClick={() => setOpen(true)} variant="ghost" size="sm">
				<UserRound />
				{translator?.t('flyout.login-button')}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="z-200" overlayClassName="z-200">
					<DialogHeader>
						<DialogTitle>{translator?.t('flyout.title')}</DialogTitle>
					</DialogHeader>

					<div className="mt-4">
						<MagicLinkLoginForm key={open ? 'open' : 'closed'} lang={lang} />
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};
