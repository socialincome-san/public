import { type CountryCode } from '../../generated/prisma/enums';
import { toCountryCode } from '../types/country';

// The hosting platform's geo-IP headers: https://vercel.com/docs/headers/request-headers
const COUNTRY_HEADER = 'x-vercel-ip-country';
const REGION_HEADER = 'x-vercel-ip-country-region';
const CITY_HEADER = 'x-vercel-ip-city';
const IP_HEADER = 'x-real-ip';

// Only set when the visitor picks a country, so it needs no consent.
export const VISITOR_COUNTRY_COOKIE = 'si_country';

type CookieReader = { get: (name: string) => { value: string } | undefined };

export const getChosenCountry = (cookies: CookieReader): CountryCode | null =>
	toCountryCode(cookies.get(VISITOR_COUNTRY_COOKIE)?.value);

export const getVisitorCountry = ({ headers, cookies }: { headers: Headers; cookies: CookieReader }): CountryCode | null =>
	getChosenCountry(cookies) ?? toCountryCode(headers.get(COUNTRY_HEADER));

export const getVisitorLocation = (headers: Headers) => {
	const encodedCity = headers.get(CITY_HEADER);

	return {
		country: headers.get(COUNTRY_HEADER),
		region: headers.get(REGION_HEADER),
		city: encodedCity ? decodeURIComponent(encodedCity) : null,
		ip: headers.get(IP_HEADER),
	};
};
