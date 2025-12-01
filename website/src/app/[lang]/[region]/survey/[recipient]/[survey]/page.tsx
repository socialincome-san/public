'use client';

import { Survey, SurveyLanguage } from '@/app/[lang]/[region]/survey/[recipient]/[survey]/survey';
import { useAuth } from '@/lib/firebase/hooks/useAuth';
import { Button, Input } from '@socialincome/ui';
import { User, signInWithEmailAndPassword } from 'firebase/auth';
import { useSearchParams } from 'next/navigation';
import { FormEvent, use, useEffect, useState } from 'react';
import { SurveyPageProps } from './layout';

export default function Page({ params }: SurveyPageProps) {
	const { recipient, survey, lang } = use(params);
	const { auth } = useAuth();
	const [email, setEmail] = useState<string | null>(null);
	const [password, setPassword] = useState<string | null>(null);
	const [user, setUser] = useState<User>();
	const searchParams = useSearchParams();

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
		return <Survey surveyId={survey} recipientId={recipient} lang={lang as SurveyLanguage} />;
	} else {
		return (
			<form className="theme-new mx-auto flex max-w-md flex-col space-y-2" method="post" onSubmit={handleSubmit}>
				<Input name="email" type="text" placeholder="Email" />
				<Input name="password" type="password" placeholder="Password" />
				<Button type="submit" className="btn btn-primary mx-auto">
					Save
				</Button>
			</form>
		);
	}
}
