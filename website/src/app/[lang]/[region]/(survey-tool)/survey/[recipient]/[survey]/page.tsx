'use client';

import { Survey, SurveyLanguage } from '@/app/[lang]/[region]/(survey-tool)/survey/[recipient]/[survey]/survey';
import { Button, Input } from '@socialincome/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { User, signInWithEmailAndPassword } from 'firebase/auth';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from 'reactfire';
import { SurveyPageProps } from './layout';

export default function Page({ params }: SurveyPageProps) {
	const auth = useAuth();
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
	}, [auth, email, password]);

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
				<Survey surveyId={params.survey} recipientId={params.recipient} lang={params.lang as SurveyLanguage} />
			</QueryClientProvider>
		);
	} else {
		return (
			<form className="mx-auto flex max-w-md flex-col space-y-2" method="post" onSubmit={handleSubmit}>
				<Input name="email" type="text" placeholder="Email" />
				<Input name="password" type="password" placeholder="Password" />
				<Button type="submit" className="btn btn-primary mx-auto">
					Save
				</Button>
			</form>
		);
	}
}
