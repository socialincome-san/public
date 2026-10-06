'use client';

import { sendMagicLoginLink } from '@/components/login/send-magic-login-link';
import { useAuth } from '@/lib/firebase/hooks/use-auth';
import { useTranslator } from '@/lib/i18n/use-translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@socialincome/design-system/button/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@socialincome/design-system/form/form';
import { Input } from '@socialincome/design-system/input/input';
import { Label } from '@socialincome/design-system/label/label';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type FormValues = {
	email: string;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Props = {
	lang: WebsiteLanguage;
	prefilledEmail?: string;
};

export const MagicLinkLoginForm = ({ lang, prefilledEmail = '' }: Props) => {
	const { auth } = useAuth();
	const translator = useTranslator(lang, 'website-login');

	const formSchema = z.object({
		email: z
			.string()
			.trim()
			.email(translator?.t('error.invalid-email') ?? 'Invalid email address'),
	});

	const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
	const [submittedEmail, setSubmittedEmail] = useState('');

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: prefilledEmail },
	});

	const handleSend = async ({ email }: FormValues) => {
		setStatus('sending');
		setSubmittedEmail(email);

		try {
			await sendMagicLoginLink({ auth, email });
		} catch {
			// Intentionally ignore errors to avoid account enumeration.
		}

		await delay(1200);

		setStatus('sent');
	};

	const retry = () => {
		form.reset();
		setStatus('idle');
	};

	return (
		<>
			{status === 'idle' && (
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSend)} className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<Label>{translator?.t('email')}</Label>
									<FormControl>
										<Input type="email" placeholder="you@example.org" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type="submit" fullWidth>
							{translator?.t('submit-button')}
						</Button>

						<p className="text-muted-foreground text-center text-xs">{translator?.t('flyout.magic-link-description')}</p>
					</form>
				</Form>
			)}

			{status === 'sending' && <div className="text-center text-sm">{translator?.t('flyout.sending')}</div>}

			{status === 'sent' && (
				<div className="space-y-4 text-center">
					<p className="text-sm">{translator?.t('flyout.sent-message', { context: { email: submittedEmail } })}</p>

					<Button variant="outline" onClick={retry} fullWidth>
						{translator?.t('flyout.retry')}
					</Button>

					<p className="text-muted-foreground text-xs">
						{translator?.t('flyout.support-prefix')}{' '}
						<a className="underline" href="mailto:support@socialincome.org">
							support@socialincome.org
						</a>
					</p>
				</div>
			)}
		</>
	);
};
