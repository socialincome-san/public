'use server';

import { LANGUAGE_COOKIE } from '@/app/[lang]/[region]';
import { defaultLanguage } from '@/lib/i18n/utils';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const switchToDefaultLanguageAction = async (pathname: string) => {
	const segments = pathname.split('/').filter(Boolean);
	if (segments.length < 2) {
		redirect(`/${defaultLanguage}/int`);
	}

	segments[0] = defaultLanguage;
	(await cookies()).set(LANGUAGE_COOKIE, defaultLanguage, {
		path: '/',
		maxAge: 60 * 60 * 24 * 7,
		sameSite: 'lax',
	});

	redirect(`/${segments.join('/')}`);
};
