'use client';

import { Survey, SurveyLanguage } from '@/app/[lang]/[region]/survey/[recipient]/[survey]/survey';
import { Button, Input } from '@socialincome/ui';
import { useSearchParams } from 'next/navigation';
import { FormEvent, use, useEffect, useState } from 'react';
import { SurveyPageProps } from './layout';
import { useSurvey } from './use-survey';

export default function Page({ params }: SurveyPageProps) {
  const { recipient, survey, lang } = use(params);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const { hasError, login } = useSurvey();

  const tryLogin = async (email: string | null, password: string | null) => {
    if (email && password) {
      login(email, password).then((loggedIn) => {
        setIsLoggedIn(loggedIn);
      });
    }
  };

  useEffect(() => {
    tryLogin(searchParams.get('email'), searchParams.get('pw'));
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Prevent the browser from reloading the page
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    tryLogin(formData.get('email') as string, formData.get('password') as string);
  };

  if (isLoggedIn && !hasError) {
    return <Survey surveyId={survey} recipientId={recipient} lang={lang as SurveyLanguage} />;
  } else if (hasError) {
    return <div className="theme-new mx-auto max-w-md">Error logging in. Please check your credentials.</div>;
  }

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
