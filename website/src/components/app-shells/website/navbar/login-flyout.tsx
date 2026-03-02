'use client';

import { Button } from '@/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/form';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { useAuth } from '@/lib/firebase/hooks/useAuth';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { UserRound } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
	email: z.string().trim().email('Please enter a valid email address.'),
});

type FormValues = z.infer<typeof formSchema>;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Props = {
	lang: WebsiteLanguage;
};

export const LoginFlyout = ({ lang }: Props) => {
	const { auth } = useAuth();
	const translator = useTranslator(lang, 'website-login');

	const [open, setOpen] = useState(false);
	const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
	const [submittedEmail, setSubmittedEmail] = useState('');

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: '' },
	});

	const handleSend = async ({ email }: FormValues) => {
		setStatus('sending');
		setSubmittedEmail(email);

		try {
			localStorage.setItem('loginEmail', email);

			const actionCodeSettings = {
				url: `${window.location.origin}/${NEW_WEBSITE_SLUG}/auth/confirm-login`,
				handleCodeInApp: true,
			};

			await sendSignInLinkToEmail(auth, email, actionCodeSettings);
		} catch {
			// intentionally ignore errors to avoid attacking information disclosure
		}

		// prevent timing attacks
		await delay(1200);

		setStatus('sent');
	};

	const retry = () => {
		form.reset();
		setStatus('idle');
	};

	return (
		<>
			<Button data-testid="login-button" onClick={() => setOpen(true)} variant="ghost" size="sm">
				<UserRound />
				{translator?.t('flyout.login-button')}
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{translator?.t('flyout.title')}</DialogTitle>
					</DialogHeader>

					{status === 'idle' && (
						<Form {...form}>
							<form onSubmit={form.handleSubmit(handleSend)} className="mt-4 space-y-4">
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

								<Button type="submit" className="w-full">
									{translator?.t('submit-button')}
								</Button>

								<p className="text-muted-foreground text-center text-xs">
									{translator?.t('flyout.magic-link-description')}
								</p>
							</form>
						</Form>
					)}

					{status === 'sending' && <div className="mt-4 text-center text-sm">{translator?.t('flyout.sending')}</div>}

					{status === 'sent' && (
						<div className="mt-4 space-y-4 text-center">
							<p className="text-sm">{translator?.t('flyout.sent-message', { context: { email: submittedEmail } })}</p>

							<Button variant="outline" onClick={retry} className="w-full">
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

					<div className="mt-6 border-t pt-4 text-center">
						<p className="text-sm">
							{translator?.t('flyout.no-account')}{' '}
							<Link href="/get-started" className="underline">
								{translator?.t('flyout.get-started')}
							</Link>
						</p>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};
