'use client';

import { DefaultLayoutProps } from '@/app/[lang]/[country]';
import { onLanguageChange } from '@/components/navbar/language-switcher';
import { ValidCountry } from '@/i18n';
import { GlobeAltIcon, LanguageIcon } from '@heroicons/react/24/solid';
import { LanguageCode } from '@socialincome/shared/src/types/Language';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@socialincome/ui';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';
import { ReadonlyURLSearchParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

type FooterClientProps = {
	supportedTranslatedLanguages: { code: LanguageCode; translation: string }[];
	supportedTranslatedCountries: { code: ValidCountry; translation: string }[];
} & DefaultLayoutProps;

function onCountryChange(country: ValidCountry, router: AppRouterInstance, searchParams: ReadonlyURLSearchParams) {
	const pathSegments = window.location.pathname.split('/');
	pathSegments[2] = country;
	const current = new URLSearchParams(Array.from(searchParams.entries()));
	router.push(pathSegments.join('/') + '?' + current.toString());
}

// TODO: i18n
function FooterComponent({ params, supportedTranslatedLanguages, supportedTranslatedCountries }: FooterClientProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const initialCountry = supportedTranslatedCountries.find(
		(candidateCountry) => candidateCountry.code === params.country,
	);
	const initialLanguage = supportedTranslatedLanguages.find(
		(candidateLanguage) => candidateLanguage.code === params.lang,
	);

	return (
		<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
			<Select onValueChange={(l: LanguageCode) => onLanguageChange(l, router, searchParams)}>
				<SelectTrigger className="space-x-2">
					<LanguageIcon className="h-4 w-4" />
					<SelectValue placeholder={initialLanguage?.translation} />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Language</SelectLabel>
						{supportedTranslatedLanguages.map((supportedLanguage, index) => (
							<SelectItem key={index} value={supportedLanguage.code}>
								{supportedLanguage.translation}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			<Select onValueChange={(c: ValidCountry) => onCountryChange(c, router, searchParams)}>
				<SelectTrigger className="space-x-2">
					<GlobeAltIcon className="h-4 w-4" />
					<SelectValue placeholder={initialCountry?.translation} />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Country</SelectLabel>
						{supportedTranslatedCountries.map((country, index) => (
							<SelectItem key={index} value={country.code}>
								{country.translation}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>
	);
}
export function FooterClient(props: FooterClientProps) {
	return (
		<Suspense>
			<FooterComponent {...props} />
		</Suspense>
	);
}
