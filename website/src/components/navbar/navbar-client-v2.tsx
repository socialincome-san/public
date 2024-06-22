'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { getFlagComponentByCurrency } from '@/components/country-flags';
import { SIIcon } from '@/components/logos/si-icon';
import { SILogo } from '@/components/logos/si-logo';
import { useI18n } from '@/components/providers/context-providers';
import { WebsiteCurrency } from '@/i18n';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import { Typography } from '@socialincome/ui';
import classNames from 'classnames';
import Link from 'next/link';
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
}: NavbarProps) {
	const [transparent, setTransparent] = useState(false);
	let { currency, setCurrency } = useI18n();
	const Flag = getFlagComponentByCurrency(currency);

	const NavbarLink = ({ href, children, className }: { href: string; children: string; className?: string }) => (
		<Link href={`/${lang}/${region}${href}`} className={classNames('hover:text-accent text-lg', className)}>
			{children}
		</Link>
	);

	return (
		<nav
			className={classNames('theme-blue-v2 group/navbar bg-background fixed inset-x-0 top-0 z-20 flex flex-col', {
				'bg-transparent': transparent,
			})}
		>
			<div className="h-navbar hidden flex-row items-baseline justify-between gap-4 overflow-hidden px-8 py-5 transition-[height] duration-500 ease-in group-hover/navbar:h-80 md:flex">
				<div className="flex h-full flex-shrink flex-grow-0 flex-col md:w-64">
					<div>
						<SILogo className="mr-auto hidden h-6 lg:block " onClick={() => setTransparent(!transparent)} />
						<SIIcon className="-mb-2.5 block h-9 lg:hidden" />
					</div>
					<div className="mt-6 hidden h-full flex-col justify-start group-hover/navbar:flex group-active/navbar:flex">
						<NavbarLink href={`/v2/`}>Journal</NavbarLink>
						<NavbarLink href={`/v2/`}>My Account</NavbarLink>
						<NavbarLink href={`/v2/`} className="text-accent mt-auto">
							Donate
						</NavbarLink>
					</div>
				</div>
				<div className="-ml-64 flex-1" /> {/* Because the first column has flex-grow-0 */}
				<div className="flex min-w-96 flex-1 flex-row">
					<div className="group/about-us flex-1">
						<NavbarLink href={`/v2`}>About us</NavbarLink>
						<div className="mt-6 hidden flex-col opacity-0 group-hover/navbar:flex group-hover/about-us:opacity-100">
							<NavbarLink href={`/v2/`}>Mission</NavbarLink>
							<NavbarLink href={`/v2/`}>People</NavbarLink>
							<NavbarLink href={`/v2/`}>Technology</NavbarLink>
							<NavbarLink href={`/v2/`}>Contact</NavbarLink>
						</div>
					</div>
					<div className="group/our-work flex-1">
						<NavbarLink href={`/v2`}>Our Work</NavbarLink>
						<div className="mt-6 hidden flex-col opacity-0 group-hover/navbar:flex group-hover/our-work:opacity-100">
							<NavbarLink href={`/v2/`}>Fight Poverty</NavbarLink>
							<NavbarLink href={`/v2/`}>Cash Transfers</NavbarLink>
							<NavbarLink href={`/v2/`}>Basic Income</NavbarLink>
							<NavbarLink href={`/v2/`}>Active Programs</NavbarLink>
						</div>
					</div>
					<div className="group/transparency flex-1">
						<NavbarLink href={`/v2`}>Transparency</NavbarLink>
						<div className="mt-6 hidden flex-col opacity-0 group-hover/navbar:flex group-hover/transparency:opacity-100">
							<NavbarLink href={`/v2/`}>Finances</NavbarLink>
							<NavbarLink href={`/v2/`}>Evidence</NavbarLink>
							<NavbarLink href={`/v2/`}>Recipient Selection</NavbarLink>
							<NavbarLink href={`/v2/`}>Open Source</NavbarLink>
							<NavbarLink href={`/v2/`}>Reports</NavbarLink>
							<NavbarLink href={`/v2/`}>FAQ</NavbarLink>
						</div>
					</div>
				</div>
				<div className="group/i18n flex h-full flex-1 flex-col">
					<div className="flex flex-row items-baseline justify-end">
						{Flag && <Flag className="m-auto mx-2 h-5 w-5 rounded-full" />}
						<Typography size="lg">{languages.find((l) => l.code === lang)?.translation}</Typography>
					</div>
					<div className="mt-6 hidden h-full grid-cols-1 justify-items-start gap-2 overflow-visible text-left opacity-0 group-hover/navbar:grid group-hover/i18n:opacity-100 lg:grid-cols-3 lg:justify-items-end lg:gap-8">
						<div className="flex w-full flex-col items-end">
							{regions.map((reg, index) => (
								<Link
									key={index}
									href={`/${lang}/${reg.code}/v2`}
									className={classNames('hover:text-accent text-lg', { 'text-accent': reg.code === region })}
								>
									{reg.translation}
								</Link>
							))}
						</div>
						<div className="flex w-full flex-col items-end">
							{languages.map((l, index) => (
								<Link
									key={index}
									href={`/${l.code}/${region}/v2`}
									className={classNames('hover:text-accent text-lg', { 'text-accent': l.code === lang })}
								>
									{l.translation}
								</Link>
							))}
						</div>
						<div className="flex w-full flex-col items-end">
							{currencies.map((curr, index) => (
								<Typography
									key={index}
									as="button"
									size="lg"
									className={classNames('hover:text-accent text-left text-lg hover:cursor-pointer', {
										'text-accent': curr.code === currency,
									})}
									onClick={() => setCurrency(curr.code)}
								>
									{curr.code}
								</Typography>
							))}
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
}
