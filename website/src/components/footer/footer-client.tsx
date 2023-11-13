'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { useI18n } from '@/app/context-providers';
import { WebsiteLanguage, WebsiteRegion } from '@/i18n';
import { GlobeAltIcon, LanguageIcon } from '@heroicons/react/24/solid';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@socialincome/ui';
import { Suspense } from 'react';

type FooterClientProps = {
	languages: { code: WebsiteLanguage; translation: string }[];
	regions: { code: WebsiteRegion; translation: string }[];
} & DefaultParams;

// TODO: i18n
function FooterComponent({ lang, region, languages, regions }: FooterClientProps) {
	const { setLanguage, setRegion } = useI18n();

	const initialCountry = regions.find((candidateCountry) => candidateCountry.code === region);
	const initialLanguage = languages.find((candidateLanguage) => candidateLanguage.code === lang);

	return (
		<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
			<Select onValueChange={(l: WebsiteLanguage) => setLanguage(l)}>
				<SelectTrigger className="space-x-2">
					<LanguageIcon className="h-4 w-4" />
					<SelectValue placeholder={initialLanguage?.translation} />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Language</SelectLabel>
						{languages.map((supportedLanguage, index) => (
							<SelectItem key={index} value={supportedLanguage.code}>
								{supportedLanguage.translation}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			<Select onValueChange={(c: WebsiteRegion) => setRegion(c)}>
				<SelectTrigger className="space-x-2">
					<GlobeAltIcon className="h-4 w-4" />
					<SelectValue placeholder={initialCountry?.translation} />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Country</SelectLabel>
						{regions.map((country, index) => (
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
