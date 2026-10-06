'use client';

import { MagicLinkLoginForm } from '@/components/login/magic-link-login-form';
import { useTranslator } from '@/lib/i18n/use-translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Button } from '@socialincome/design-system/actions/button/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
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
			<Button data-testid="login-button" onClick={() => setOpen(true)} variant="ghost" size="md">
				<UserRound />
				{translator?.t('flyout.login-button')}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{translator?.t('flyout.title')}</DialogTitle>
					</DialogHeader>

					<MagicLinkLoginForm key={open ? 'open' : 'closed'} lang={lang} />
				</DialogContent>
			</Dialog>
		</>
	);
};
