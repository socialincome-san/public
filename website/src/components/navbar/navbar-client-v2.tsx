'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { I18nDialog } from '@/components/i18n-dialog';
import { WebsiteCurrency } from '@/i18n';
import { GlobeEuropeAfricaIcon, LanguageIcon } from '@heroicons/react/24/solid';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import { Button, Typography } from '@socialincome/ui';
import classNames from 'classnames';
import { useParams, usePathname } from 'next/dist/client/components/navigation';
import { useState } from 'react';

type NavigationSection = {
	title: string;
	href?: string;
	links?: {
		title: string;
		href: string;
	}[];
};

type NavbarProps = {
	backgroundColor?: string;
	navigation: NavigationSection[];
	showNavigation?: boolean;
	translations: {
		language: string;
		region: string;
		currency: string;
		myProfile: string;
		contactDetails: string;
		payments: string;
		signOut: string;
	};
	languages: {
		code: LanguageCode;
		translation: string;
	}[];
	regions: {
		code: string;
		translation: string;
	}[];
	currencies: {
		code: WebsiteCurrency;
		translation: string;
	}[];
} & DefaultParams;

export function NavbarClientV2({
	lang,
	region,
	translations,
	languages,
	regions,
	currencies,
	navigation = [],
	showNavigation = true,
}: NavbarProps) {
	const [transparent, setTransparent] = useState(true);

	const pathname = usePathname();
	const params = useParams();

	console.log(params);
	console.log(pathname);

	const i18nDialog = (
		<I18nDialog
			languages={languages}
			regions={regions}
			currencies={currencies}
			translations={{
				language: translations.language,
				region: translations.region,
				currency: translations.currency,
			}}
		>
			<Button variant="ghost" className="flex max-w-md space-x-2 py-6">
				<LanguageIcon className="h-6 w-6" />
				<GlobeEuropeAfricaIcon className="h-6 w-6" />
			</Button>
		</I18nDialog>
	);

	return (
		<nav
			className={classNames('group fixed inset-x-0 top-0 z-20 flex flex-col', {
				'bg-transparent': transparent,
				'bg-muted': !transparent,
			})}
		>
			<div className="h-navbar flex w-full flex-row justify-between">
				<div onClick={() => setTransparent(!transparent)}>Logo</div>
				<div>Selects</div>
				<div>Langs</div>
			</div>
			<div className="h-0 flex-col overflow-hidden transition-[height] duration-500 ease-in group-hover:flex group-hover:h-48 group-active:h-48">
				<Typography>Hello</Typography>
				<Typography>Hello</Typography>
				<Typography>Hello</Typography>
				<Typography>Hello</Typography>
				<Typography>Hello</Typography>
			</div>
		</nav>
	);
}
