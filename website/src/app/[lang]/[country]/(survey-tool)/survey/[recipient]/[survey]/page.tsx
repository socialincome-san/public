'use client';

import { auth } from '@/firebase';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { User, signInWithEmailAndPassword } from 'firebase/auth';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { SurveyPageProps } from './layout';
import { Survey } from './survey';

export default function Page({ params }: SurveyPageProps) {
	const [email, setEmail] = useState<string | null>(null);
	const [password, setPassword] = useState<string | null>(null);
	const [user, setUser] = useState<User>();
	const searchParams = useSearchParams();
	const queryClient = new QueryClient();

	useEffect(() => {
		setEmail(searchParams.get('email'));
		setPassword(searchParams.get('pw'));
	}, [searchParams]);

	useEffect(() => {
		if (email && password) {
			signInWithEmailAndPassword(auth, email, password)
				.then((userCredential) => {
					setUser(userCredential.user);
				})
				.catch((error) => {
					console.log(error);
				});
		}
	}, [email, password]);

	function handleSubmit(e: FormEvent<HTMLFormElement>) {
		// Prevent the browser from reloading the page
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		setEmail(formData.get('email') as string);
		setPassword(formData.get('password') as string);
	}

	if (user) {
		return (
			<QueryClientProvider client={queryClient}>
				<Survey surveyId={params.survey} recipientId={params.recipient} lang={params.lang} />
			</QueryClientProvider>
		);
	} else {
		return (
			<form className="flex flex-col mx-auto space-y-2" method="post" onSubmit={handleSubmit}>
				<input name="email" type="text" placeholder="Email" className="input input-bordered w-full max-w-xs mx-auto" />
				<input
					name="password"
					type="text"
					placeholder="Password"
					className="input input-bordered w-full max-w-xs mx-auto"
				/>
				<button type="submit" className="btn btn-primary mx-auto">
					Save
				</button>
			</form>
		);
	}
}
