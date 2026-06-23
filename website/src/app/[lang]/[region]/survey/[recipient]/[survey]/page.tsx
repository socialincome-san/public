'use client';

import { Survey, SurveyLanguage } from '@/app/[lang]/[region]/survey/[recipient]/[survey]/survey';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { useSearchParams } from 'next/navigation';
import { type FormEvent, use, useEffect, useState } from 'react';
import { type SurveyPageProps } from './layout';
import { useSurvey } from './use-survey';

export default function Page({ params }: SurveyPageProps) {
	const { recipient, survey, lang } = use(params);
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	const searchParams = useSearchParams();
	const { hasError, login } = useSurvey();

	const tryLogin = (email: string | null, password: string | null) => {
		if (email && password) {
			void login(email, password).then((loggedIn) => {
				setIsLoggedIn(loggedIn);
			});
		}
	};

	useEffect(() => {
		tryLogin(searchParams.get('email'), searchParams.get('pw'));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		// Prevent the browser from reloading the page
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		tryLogin(formData.get('email') as string, formData.get('password') as string);
	};

	if (isLoggedIn && !hasError) {
		return <Survey surveyId={survey} recipientId={recipient} lang={lang as SurveyLanguage} />;
	}

	if (hasError) {
		return (
			<div className="text-destructive mx-auto max-w-md rounded-2xl bg-red-50 px-5 py-4 text-sm">
				Error logging in. Please check your credentials.
			</div>
		);
	}

	return (
		<form className="mx-auto flex max-w-md flex-col gap-4" method="post" onSubmit={handleSubmit}>
			<div className="space-y-1 text-center">
				<h1 className="text-2xl font-semibold tracking-tight">Open your survey</h1>
				<p className="text-muted-foreground text-sm">Enter the access details from your survey link.</p>
			</div>
			<div className="space-y-3">
				<Input name="email" type="email" placeholder="Email" />
				<Input name="password" type="password" placeholder="Password" />
			</div>
			<Button type="submit" className="mx-auto rounded-full px-6">
				Open survey
			</Button>
		</form>
	);
}
