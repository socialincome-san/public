'use client';

import { ReadonlyURLSearchParams, useRouter, useSearchParams } from 'next/navigation';

import { DefaultLayoutProps } from '@/app/[lang]/[country]';
import { onLanguageChange } from '@/components/navbar/language-switcher';
import { ValidCountry } from '@/i18n';
import { Language } from '@socialincome/shared/src/types';
import { SoCombobox, SoSelect } from '@socialincome/ui';
import { useState } from 'react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';

type FooterClientProps = {
	supportedTranslatedLanguages: { code: Language; translation: string }[];
	supportedTranslatedCountries: { code: ValidCountry; translation: string }[];
} & DefaultLayoutProps;

type CountryOption = {
	label: string;
	code: ValidCountry;
};

function onCountryChange(country: ValidCountry, router: AppRouterInstance, searchParams: ReadonlyURLSearchParams) {
	const pathSegments = window.location.pathname.split('/');
	pathSegments[2] = country;
	const current = new URLSearchParams(Array.from(searchParams.entries()));
	router.push(pathSegments.join('/') + '?' + current.toString());
}

export function FooterClient({
	params,
	supportedTranslatedLanguages,
	supportedTranslatedCountries,
}: FooterClientProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const languageOptions = supportedTranslatedLanguages.reduce(
		(obj, current) => ({ ...obj, [current.code]: { label: current.translation, value: current.code } }),
		{},
	);
	const initialLanguage = params.lang;

	const countriesOptions = supportedTranslatedCountries.map((country) => {
		return {
			label: country.translation,
			code: country.code,
		};
	});
	const initialCountry = countriesOptions.find((candidateCountry) => candidateCountry.code === params.country);
	const [selectedCountry, setSelectedCountry] = useState(initialCountry);

	return (
		<>
			<div>
				<SoSelect
					label="language"
					labelHidden={true}
					block={true}
					selected={initialLanguage}
					options={languageOptions}
					onChange={(l: Language) => onLanguageChange(l, router, searchParams)}
				/>
			</div>
			<div>
				<SoCombobox
					label="country"
					labelHidden={true}
					block={true}
					options={countriesOptions}
					value={selectedCountry}
					onChange={(c: CountryOption) => {
						setSelectedCountry(c);
						onCountryChange(c.code, router, searchParams);
					}}
				/>
			</div>
		</>
	);
}
