'use client';

import { Button } from '@/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/form';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { useAuth } from '@/lib/firebase/hooks/useAuth';
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

export const LoginFlyout = () => {
	const { auth } = useAuth();

	const [open, setOpen] = useState(false);
	const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
	const [submittedEmail, setSubmittedEmail] = useState('');

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: { email: '' },
	});

	const handleSend = async ({ email }: FormValues) => {
		setStatus('sending');

		try {
			localStorage.setItem('loginEmail', email);

			const actionCodeSettings = {
				url: `${window.location.origin}/new-website/auth/finish-login`,
				handleCodeInApp: true,
			};

			await sendSignInLinkToEmail(auth, email, actionCodeSettings);

			setSubmittedEmail(email);
		} catch {
			// intentionally ignore errors to avoid enumeration
		}

		// fixed delay prevents timing attacks
		await delay(1200);

		setStatus('sent');
	};

	const retry = () => {
		form.reset();
		setStatus('idle');
	};

	return (
		<>
			<button
				data-testid="login-button"
				onClick={() => setOpen(true)}
				className="flex items-center gap-2 text-base font-medium"
			>
				<UserRound className="h-4 w-4" />
				Login
			</button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Sign in</DialogTitle>
					</DialogHeader>

					{status === 'idle' && (
						<Form {...form}>
							<form onSubmit={form.handleSubmit(handleSend)} className="mt-4 space-y-4">
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<Label>Email</Label>
											<FormControl>
												<Input type="email" placeholder="you@example.org" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button type="submit" className="w-full">
									Send login link
								</Button>

								<p className="text-muted-foreground text-center text-xs">We’ll send you a magic link to sign in.</p>
							</form>
						</Form>
					)}

					{status === 'sending' && <div className="mt-4 text-center text-sm">Sending…</div>}

					{status === 'sent' && (
						<div className="mt-4 space-y-4 text-center">
							<p className="text-sm">
								If an account exists for <span className="font-medium">{submittedEmail}</span>, you’ll receive a login
								link shortly.
							</p>

							<Button variant="outline" onClick={retry} className="w-full">
								Retry
							</Button>

							<p className="text-muted-foreground text-xs">
								If it doesn’t arrive, contact{' '}
								<a className="underline" href="mailto:support@socialincome.org">
									support@socialincome.org
								</a>
							</p>
						</div>
					)}

					<div className="mt-6 border-t pt-4 text-center">
						<p className="text-sm">
							Don’t have an account?{' '}
							<Link href="/get-started" className="underline">
								Learn how to get started
							</Link>
						</p>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};
