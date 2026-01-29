'use client';

import { Button } from '@/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { useAuth } from '@/lib/firebase/hooks/useAuth';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { UserRound } from 'lucide-react';
import Link from 'next/link';
import { useReducer, useState } from 'react';
import { z } from 'zod';

const emailSchema = z.string().trim().email('Please enter a valid email address.');

type State = {
	email: string;
	error: string | null;
	status: 'idle' | 'sending' | 'sent' | 'error';
};

type Action =
	| { type: 'SET_EMAIL'; email: string }
	| { type: 'SET_ERROR'; error: string | null }
	| { type: 'SET_STATUS'; status: State['status'] }
	| { type: 'RESET' };

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case 'SET_EMAIL':
			return { ...state, email: action.email };
		case 'SET_ERROR':
			return { ...state, error: action.error };
		case 'SET_STATUS':
			return { ...state, status: action.status };
		case 'RESET':
			return { email: '', error: null, status: 'idle' };
		default:
			return state;
	}
}

export const LoginFlyout = () => {
	const { auth } = useAuth();

	const [open, setOpen] = useState(false);
	const [state, dispatch] = useReducer(reducer, {
		email: '',
		error: null,
		status: 'idle',
	});

	const handleSend = async () => {
		const result = emailSchema.safeParse(state.email);

		if (!result.success) {
			dispatch({
				type: 'SET_ERROR',
				error: result.error.issues[0]?.message ?? 'Invalid email',
			});
			return;
		}

		dispatch({ type: 'SET_ERROR', error: null });
		dispatch({ type: 'SET_STATUS', status: 'sending' });

		try {
			const email = result.data;

			localStorage.setItem('loginEmail', email);

			const actionCodeSettings = {
				url: `${window.location.origin}/new-website/auth/finish-login`,
				handleCodeInApp: true,
			};

			await sendSignInLinkToEmail(auth, email, actionCodeSettings);

			dispatch({ type: 'SET_STATUS', status: 'sent' });
		} catch {
			dispatch({ type: 'SET_STATUS', status: 'error' });
		}
	};

	const retry = () => {
		dispatch({ type: 'SET_STATUS', status: 'idle' });
	};

	return (
		<>
			<button onClick={() => setOpen(true)} className="flex items-center gap-2 text-base font-medium">
				<UserRound className="h-4 w-4" />
				Login
			</button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Sign in</DialogTitle>
					</DialogHeader>

					{state.status === 'idle' && (
						<div className="mt-4 space-y-4">
							<div className="space-y-2">
								<Label>Email</Label>
								<Input
									type="email"
									value={state.email}
									onChange={(e) =>
										dispatch({
											type: 'SET_EMAIL',
											email: e.target.value,
										})
									}
									placeholder="you@example.org"
								/>
								{state.error && <p className="text-destructive text-xs">{state.error}</p>}
							</div>

							<Button className="w-full" onClick={handleSend}>
								Send login link
							</Button>

							<p className="text-muted-foreground text-center text-xs">We’ll send you a magic link to sign in.</p>
						</div>
					)}

					{state.status === 'sending' && <div className="mt-4 text-center text-sm">Sending…</div>}

					{state.status === 'sent' && (
						<div className="mt-4 space-y-4 text-center">
							<p className="text-sm">
								We sent a login link to <span className="font-medium">{state.email}</span>.
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

					{state.status === 'error' && (
						<div className="mt-4 space-y-4 text-center">
							<p className="text-sm">Something went wrong.</p>
							<Button variant="outline" onClick={retry} className="w-full">
								Try again
							</Button>
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
