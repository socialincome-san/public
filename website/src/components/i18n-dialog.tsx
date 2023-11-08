'use client';

import { useI18n } from '@/app/providers/i18n-provider-client';
import { WebsiteCurrency, WebsiteLanguage, WebsiteRegion } from '@/i18n';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { GlobeEuropeAfricaIcon, LanguageIcon } from '@heroicons/react/24/solid';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import {
	Dialog,
	DialogContent,
	DialogTrigger,
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@socialincome/ui';
import _ from 'lodash';
import { PropsWithChildren, useState } from 'react';
import { Currency } from '../../../shared/src/types/currency';

type I18nDialogProps = {
	languages: {
		code: LanguageCode;
		translation: string;
	}[];
	regions: {
		code: string;
		translation: string;
	}[];
	currencies: {
		code: Currency;
		translation: string;
	}[];
	translations: {
		language: string;
		currentLanguage: string;
		region: string;
		currentRegion: string;
		currency: string;
		currentCurrency: string;
	};
};

export function I18nDialog({
	languages,
	regions,
	currencies,
	translations,
	children,
}: PropsWithChildren<I18nDialogProps>) {
	const [open, setOpen] = useState(false);
	const { language, setLanguage, region, setRegion, currency, setCurrency } = useI18n();

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-w-sm p-12">
				{!_.isEmpty(languages) && (
					<Select value={language} onValueChange={(l: WebsiteLanguage) => setLanguage(l)}>
						<SelectTrigger className="space-x-2">
							<LanguageIcon className="h-4 w-4" />
							<SelectValue placeholder={translations.currentLanguage} />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>{translations.language}</SelectLabel>
								{languages.map((lang, index) => (
									<SelectItem key={index} value={lang.code}>
										{lang.translation}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				)}

				{!_.isEmpty(regions) && (
					<Select value={region} onValueChange={(c: WebsiteRegion) => setRegion(c)}>
						<SelectTrigger className="space-x-2">
							<GlobeEuropeAfricaIcon className="h-4 w-4" />
							<SelectValue placeholder={translations.currentRegion} />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>{translations.region}</SelectLabel>
								{regions.map((country, index) => (
									<SelectItem key={index} value={country.code}>
										{country.translation}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				)}

				{!_.isEmpty(currencies) && (
					<Select
						value={currency}
						onValueChange={(currency: WebsiteCurrency) => {
							setCurrency(currency);
							setOpen(false);
						}}
					>
						<SelectTrigger className="space-x-2">
							<CurrencyDollarIcon className="h-4 w-4" />
							<SelectValue placeholder={translations.currentCurrency} />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>{translations.currency}</SelectLabel>
								{currencies.map((currency, index) => (
									<SelectItem key={index} value={currency.code}>
										{currency.translation}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				)}
			</DialogContent>
		</Dialog>
	);
}
