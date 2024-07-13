'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { getFlagComponentByCurrency } from '@/components/country-flags';
import { DonateIcon } from '@/components/logos/donate-icon';
import { SIIcon } from '@/components/logos/si-icon';
import { SILogo } from '@/components/logos/si-logo';
import { useNavbarBackgroundColor } from '@/components/navbar/useNavbarBackgroundColor';
import { useI18n } from '@/components/providers/context-providers';
import { WebsiteCurrency } from '@/i18n';
import { Bars3Icon, ChevronLeftIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import { Typography } from '@socialincome/ui';
import classNames from 'classnames';
import _ from 'lodash';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

type NavigationSection = {
	id: string;
	title: string;
	href: string;
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
	sections?: NavigationSection[];
} & DefaultParams;

const MobileNavigation = ({ lang, region, languages, regions, currencies, navigation, translations }: NavbarProps) => {
	const [visibleSection, setVisibleSection] = useState<
		'main' | 'our-work' | 'about-us' | 'transparency' | 'i18n' | null
	>(null);
	const { language, setLanguage, setRegion, currency, setCurrency } = useI18n();

	useEffect(() => {
		// Prevent scrolling when the navbar is expanded
		if (_.isNull(visibleSection)) {
			document.body.classList.remove('overflow-y-hidden');
		} else {
			document.body.classList.add('overflow-y-hidden');
		}
	}, [visibleSection]);

	// Navbar is collapsed
	if (_.isNull(visibleSection)) {
		return (
			<div className="flex h-16 flex-row p-5 md:hidden">
				<SILogo className="mr-auto h-6" />
				<Bars3Icon className="text-accent h-6 cursor-pointer" onClick={() => setVisibleSection('main')} />
			</div>
		);
	}

	const NavbarLink = ({ href, children, className }: { href: string; children: string; className?: string }) => (
		<Link
			href={href}
			className={twMerge('hover:active:text-accent text-3xl font-medium', className)}
			onClick={() => setVisibleSection(null)}
		>
			{children}
		</Link>
	);
	// Navbar is expanded
	let content;
	switch (visibleSection) {
		case 'about-us':
		case 'our-work':
		case 'transparency':
			const section = navigation!.find((section) => section.id === visibleSection);
			content = (
				<div className="flex flex-col space-y-8">
					<Typography size="4xl" color="accent" weight="medium">
						{section!.title}
					</Typography>
					{section?.links?.map((link, index) => (
						<NavbarLink href={link.href} key={index}>
							{link.title}
						</NavbarLink>
					))}
				</div>
			);
			break;
		case 'i18n':
			content = <div>adf</div>;
			break;
		case 'main':
		default:
			const Flag = getFlagComponentByCurrency(currency);
			content = (
				<div className="flex h-full w-full flex-col justify-between">
					<div className="flex flex-col items-start space-y-8">
						<Typography as="button" size="5xl" weight="medium" onClick={() => setVisibleSection('our-work')}>
							Our work
						</Typography>
						<Typography as="button" size="5xl" weight="medium" onClick={() => setVisibleSection('about-us')}>
							About Us
						</Typography>
						<Typography as="button" size="5xl" weight="medium" onClick={() => setVisibleSection('transparency')}>
							Transparency
						</Typography>
					</div>
					<div className="flex flex-col items-start space-y-4">
						<NavbarLink href="/v2/" className="ml-12 text-2xl">
							My Account
						</NavbarLink>
						<div className="flex-inline flex items-center">
							{Flag && <Flag className="mx-3 h-6 w-6 rounded-full" />}
							<Typography as="button" className="text-2xl font-medium" onClick={() => setVisibleSection('i18n')}>
								{currency} / {languages.find((l) => l.code === language)?.translation}
							</Typography>
						</div>
						<div className="flex-inline flex items-center">
							<DonateIcon className="mx-3 h-6 w-6" />
							<NavbarLink href="/v2/" className="text-accent text-2xl">
								Donate
							</NavbarLink>
						</div>
					</div>
				</div>
			);
			break;
	}

	return (
		<div className="bg-background flex h-[calc(100dvh)] flex-col space-y-8 p-5 pb-8 md:hidden">
			<div className="flex flex-row justify-between">
				{visibleSection === 'main' ? (
					<SILogo className="mr-auto h-6" />
				) : (
					<ChevronLeftIcon className="text-accent h-6 cursor-pointer" onClick={() => setVisibleSection('main')} />
				)}
				<XMarkIcon className="text-accent h-6 cursor-pointer" onClick={() => setVisibleSection(null)} />
			</div>
			<div className={classNames({ hidden: _.isNull(visibleSection), 'flex h-full': !_.isNull(visibleSection) })}>
				{content}
			</div>
		</div>
	);
};

const DesktopNavigation = ({ lang, region, languages, regions, currencies, navigation }: NavbarProps) => {
	let { currency, setCurrency } = useI18n();
	const Flag = getFlagComponentByCurrency(currency);
	const NavbarLink = ({ href, children, className }: { href: string; children: string; className?: string }) => (
		<Link href={href} className={twMerge('hover:text-accent text-lg', className)}>
			{children}
		</Link>
	);

	const ourWork = navigation![0];
	const aboutUs = navigation![1];
	const transparency = navigation![2];

	return (
		<div className="hidden h-20 flex-row items-baseline justify-between gap-4 overflow-hidden px-8 py-6 transition-[height] duration-500 ease-in group-hover/navbar:h-80 md:flex">
			<div className="flex h-full flex-shrink flex-grow-0 flex-col md:w-64">
				<Link href={`/${lang}/${region}/v2`}>
					<SILogo className="mr-auto hidden h-6 lg:block" />
					<SIIcon className="-mb-2.5 block h-9 lg:hidden" />
				</Link>
				<div className="mt-6 hidden h-full flex-col justify-start group-hover/navbar:flex group-active/navbar:flex">
					<NavbarLink href={`/v2/`}>Journal</NavbarLink>
					<NavbarLink href={`/v2/`}>My Account</NavbarLink>
					<div className="flex-inline mt-auto flex items-center space-x-2">
						<DonateIcon className="h-4 w-4" />
						<NavbarLink href="/v2/" className="text-accent">
							Donate
						</NavbarLink>
					</div>
				</div>
			</div>
			<div className="-ml-64 flex-1" />
			{/* Because the first column has flex-grow-0 */}
			<div className="flex min-w-96 flex-1 flex-row">
				<div className="group/about-us flex-1">
					<NavbarLink href={aboutUs.href}>About us</NavbarLink>
					<div className="mt-6 hidden flex-col opacity-0 group-hover/navbar:flex group-hover/about-us:opacity-100">
						{aboutUs?.links?.map((link, index) => (
							<NavbarLink key={index} href={link.href}>
								{link.title}
							</NavbarLink>
						))}
					</div>
				</div>
				<div className="group/our-work flex-1">
					<NavbarLink href={ourWork.href}>Our Work</NavbarLink>
					<div className="mt-6 hidden flex-col opacity-0 group-hover/navbar:flex group-hover/our-work:opacity-100">
						{ourWork?.links?.map((link: any, index: number) => (
							<NavbarLink key={index} href={link.href}>
								{link.title}
							</NavbarLink>
						))}
					</div>
				</div>
				<div className="group/transparency flex-1">
					<NavbarLink href={transparency.href}>Transparency</NavbarLink>
					<div className="mt-6 hidden flex-col opacity-0 group-hover/navbar:flex group-hover/transparency:opacity-100">
						{transparency?.links?.map((link: any, index: number) => (
							<NavbarLink key={index} href={link.href}>
								{link.title}
							</NavbarLink>
						))}
					</div>
				</div>
			</div>
			<div className="group/i18n flex h-full flex-1 flex-col">
				<div className="flex flex-row items-baseline justify-end">
					{Flag && <Flag className="m-auto mx-2 h-5 w-5 rounded-full" />}
					<Typography size="lg">{languages.find((l) => l.code === lang)?.translation}</Typography>
				</div>
				<div className="mt-6 hidden h-full grid-cols-1 justify-items-start gap-2 overflow-visible text-left opacity-0 group-hover/navbar:grid group-hover/i18n:opacity-100 lg:grid-cols-3 lg:justify-items-end lg:gap-4">
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
	);
};

export function NavbarClientV2(props: NavbarProps) {
	const { backgroundColor, setBackgroundColor } = useNavbarBackgroundColor();

	return (
		<nav className={twMerge('theme-blue-v2 group/navbar fixed inset-x-0 top-0 z-20 flex flex-col', backgroundColor)}>
			<DesktopNavigation {...props} />
			<MobileNavigation {...props} />
		</nav>
	);
}
