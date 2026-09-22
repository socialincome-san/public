'use server';

import { defaultLanguage } from '@/lib/i18n/utils';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { switchToDefaultLanguageInputSchema } from './i18n.schemas';

export const switchToDefaultLanguageAction = async (input: unknown) => {
	const pathname = switchToDefaultLanguageInputSchema.parse(input);
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

const LANGUAGE_COOKIE = 'si_lang';
