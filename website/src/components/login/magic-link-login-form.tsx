'use client';

import { OpenDonationWizardButton } from '@/components/donation-wizard/triggers/open-donation-wizard-button';
import { sendMagicLoginLink } from '@/components/login/send-magic-login-link';
import { useAuth } from '@/lib/firebase/hooks/use-auth';
import { useWebsiteBasePath } from '@/lib/i18n/website-currency';
import { Button } from '@socialincome/design-system/actions/button/button';
import { Callout } from '@socialincome/design-system/data-display/callout/callout';
import { IconList } from '@socialincome/design-system/data-display/icon-list/icon-list';
import { Separator } from '@socialincome/design-system/data-display/separator/separator';
import { AuthStatus } from '@socialincome/design-system/feedback/auth-status/auth-status';
import { MagicLinkForm } from '@socialincome/design-system/forms/magic-link-form/magic-link-form';
import { Building2, Handshake, LayoutDashboard } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { z } from 'zod';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const emailSchema = z.string().email();

type Props = {
	prefilledEmail?: string;
};

export const MagicLinkLoginForm = ({ prefilledEmail = '' }: Props) => {
	const { auth } = useAuth();
	const websiteBasePath = useWebsiteBasePath();
	const t = useTranslations('website-login');
	const tDonate = useTranslations('website-donate');

	const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
	const [email, setEmail] = useState(prefilledEmail);
	const [error, setError] = useState<string>();

	const handleSend = async (value: string) => {
		if (!emailSchema.safeParse(value).success) {
			setError(t('error.invalid-email'));

			return;
		}

		setError(undefined);
		setEmail(value);
		setStatus('sending');

		try {
			await sendMagicLoginLink({ auth, email: value, websiteBasePath });
		} catch {
			// Intentionally ignore errors to avoid account enumeration.
		}

		await delay(1200);

		setStatus('sent');
	};

	if (status === 'sent') {
		return (
			<AuthStatus
				status="sent"
				title={t('sent.title')}
				description={t.rich('sent.description', { email, strong: (chunks) => <strong>{chunks}</strong> })}
				hint={t('sent.hint')}
			>
				<Button variant="outline" size="md" fullWidth onClick={() => setStatus('idle')}>
					{t('sent.retry')}
				</Button>
			</AuthStatus>
		);
	}

	return (
		<div className="flex flex-col gap-8">
			<MagicLinkForm
				title={t('page.title')}
				description={t('page.description')}
				emailLabel={t('page.email')}
				emailPlaceholder="you@example.org"
				submitLabel={t('page.submit-button')}
				sendingLabel={t('page.sending')}
				defaultEmail={email}
				error={error}
				sending={status === 'sending'}
				onSubmit={(value) => void handleSend(value)}
			/>
			<Separator />
			<IconList
				title={t('destinations.title')}
				items={[
					{
						id: 'dashboard',
						icon: <LayoutDashboard />,
						title: t('destinations.dashboard.title'),
						description: t('destinations.dashboard.description'),
					},
					{
						id: 'partner-space',
						icon: <Handshake />,
						title: t('destinations.partner-space.title'),
						description: t('destinations.partner-space.description'),
					},
					{
						id: 'portal',
						icon: <Building2 />,
						title: t('destinations.portal.title'),
						description: t('destinations.portal.description'),
					},
				]}
			/>
			<Callout
				title={t('page.no-account.title')}
				description={t('page.no-account.description')}
				action={
					<OpenDonationWizardButton
						label={tDonate('donation-form.donate-now')}
						size="sm"
						analyticsEvent="donate_login_page_click"
					/>
				}
			/>
		</div>
	);
};
