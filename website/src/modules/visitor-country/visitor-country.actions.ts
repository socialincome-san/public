'use server';

import { type CountryCode } from '@/generated/prisma/enums';
import { getVisitorCountry, VISITOR_COUNTRY_COOKIE } from '@/lib/geo/visitor-geo';
import { resultFail, resultOk, type Result } from '@/lib/result';
import { cookies, headers } from 'next/headers';
import { chosenCountrySchema } from './visitor-country.schemas';

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export const getVisitorCountryAction = async (): Promise<Result<CountryCode | null>> => {
	try {
		return resultOk(getVisitorCountry({ headers: await headers(), cookies: await cookies() }));
	} catch (error) {
		console.error('Could not read the visitor country', { error });

		return resultFail('Could not read the visitor country');
	}
};

// Setting a cookie in a server action re-renders the current page, so the new country shows right away.
export const setChosenCountryAction = async (input: unknown): Promise<Result<boolean>> => {
	const parsed = chosenCountrySchema.safeParse(input);
	if (!parsed.success) {
		return resultFail('Invalid country');
	}

	try {
		const cookieStore = await cookies();
		if (parsed.data) {
			cookieStore.set({
				name: VISITOR_COUNTRY_COOKIE,
				value: parsed.data,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				path: '/',
				maxAge: ONE_YEAR_IN_SECONDS,
			});
		} else {
			cookieStore.delete(VISITOR_COUNTRY_COOKIE);
		}

		return resultOk(true);
	} catch (error) {
		console.error('Could not store the chosen country', { error });

		return resultFail('Could not store the chosen country');
	}
};
