'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { getFlagComponentByCurrency } from '@/components/country-flags';
import { DonateIcon } from '@/components/logos/donate-icon';
import { SIAnimatedLogo } from '@/components/logos/si-animated-logo';
import { SIIcon } from '@/components/logos/si-icon';
import { SILogo } from '@/components/logos/si-logo';
import { useI18n } from '@/components/providers/context-providers';
import { useGlobalStateProvider } from '@/components/providers/global-state-provider';
import { WebsiteCurrency, WebsiteLanguage, WebsiteRegion } from '@/i18n';
import { Bars3Icon, CheckIcon, ChevronLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
	translations: {
		contactDetails: string;
		currency: string;
		donate: string;
		language: string;
		myProfile: string;
		payments: string;
		region: string;
		signOut: string;
	};
	languages: {
		code: WebsiteLanguage;
		translation: string;
	}[];
	regions: {
		code: WebsiteRegion;
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
			<div className="flex h-16 flex-row justify-between p-5 md:hidden">
				<Link href={`/${lang}/${region}`}>
					<SIAnimatedLogo className="mr-auto h-6" />
				</Link>
				<Bars3Icon className="text-accent h-6 cursor-pointer stroke-2" onClick={() => setVisibleSection('main')} />
			</div>
		);
	}

	const NavbarLink = ({ href, children, className }: { href: string; children: string; className?: string }) => (
		<Link
			href={href}
			className={twMerge('hover:active:text-accent text-4xl font-medium', className)}
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
					<Typography size="5xl" color="accent" weight="medium">
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
			content = (
				<div className="flex flex-col space-y-8">
					<Typography size="4xl" color="accent" weight="medium">
						{translations.language}
					</Typography>
					<div className="flex flex-col space-y-2">
						{regions
							.sort((a, b) => a.translation.localeCompare(b.translation))
							.map((reg) => (
								<div key={reg.code} className="flex-inline flex items-center space-x-2">
									<CheckIcon
										className={classNames('stroke-3 h-5 w-5', {
											'text-accent': reg.code === region,
											'text-transparent': reg.code !== region,
										})}
									/>
									<Typography
										as="button"
										size="3xl"
										className="active:text-accent hover:text-accent hover:cursor-pointer"
										onClick={() => setRegion(reg.code)}
									>
										{reg.translation}
									</Typography>
								</div>
							))}
					</div>
					<div className="flex flex-col space-y-2">
						{languages
							.sort((a, b) => a.translation.localeCompare(b.translation))
							.map((l) => (
								<div key={l.code} className="flex-inline flex items-center space-x-2">
									<CheckIcon
										className={classNames('stroke-3 h-5 w-5', {
											'text-accent': l.code === language,
											'text-transparent': l.code !== language,
										})}
									/>
									<Typography
										as="button"
										size="3xl"
										className="active:text-accent hover:text-accent hover:cursor-pointer"
										onClick={() => setLanguage(l.code)}
									>
										{l.translation}
									</Typography>
								</div>
							))}
					</div>
					<div className="flex flex-col space-y-2">
						{currencies
							.sort((a, b) => a.code.localeCompare(b.code))
							.map((curr) => (
								<div key={curr.code} className="flex-inline flex items-center space-x-2">
									<CheckIcon
										className={classNames('stroke-3 h-5 w-5', {
											'text-accent': curr.code === currency,
											'text-transparent': curr.code !== currency,
										})}
									/>
									<Typography
										as="button"
										size="3xl"
										className="active:text-accent hover:text-accent hover:cursor-pointer"
										onClick={() => setCurrency(curr.code)}
									>
										{curr.code}
									</Typography>
								</div>
							))}
					</div>
				</div>
			);
			break;
		case 'main':
		default:
			const Flag = getFlagComponentByCurrency(currency);
			const ourWork = navigation![0];
			const aboutUs = navigation![1];
			const transparency = navigation![2];

			content = (
				<div className="flex h-full w-full flex-col justify-between">
					<div className="flex flex-col items-start space-y-8">
						<Typography as="button" size="5xl" weight="medium" onClick={() => setVisibleSection('our-work')}>
							{ourWork.title}
						</Typography>
						<Typography as="button" size="5xl" weight="medium" onClick={() => setVisibleSection('about-us')}>
							{aboutUs.title}
						</Typography>
						<Typography as="button" size="5xl" weight="medium" onClick={() => setVisibleSection('transparency')}>
							{transparency.title}
						</Typography>
					</div>
					<div className="flex flex-col items-start space-y-4">
						<NavbarLink href={`/${lang}/${region}/me`} className="ml-12 text-2xl">
							{translations.myProfile}
						</NavbarLink>
						<div className="flex-inline flex items-center">
							{Flag && <Flag className="mx-3 h-6 w-6 rounded-full" />}
							<Typography as="button" className="text-2xl font-medium" onClick={() => setVisibleSection('i18n')}>
								{currency} / {languages.find((l) => l.code === language)?.translation}
							</Typography>
						</div>
						<div className="flex-inline flex items-center">
							<DonateIcon className="mx-3 h-6 w-6" />
							<NavbarLink href={`/${lang}/${region}/donate/individual`} className="text-accent text-2xl">
								{translations.donate}
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
					<Link href={`/${lang}/${region}`}>
						<SILogo className="mr-auto h-6" />
					</Link>
				) : (
					<ChevronLeftIcon
						className="text-accent stroke-3 h-6 cursor-pointer"
						onClick={() => setVisibleSection('main')}
					/>
				)}
				<XMarkIcon className="text-accent stroke-3 h-6 cursor-pointer" onClick={() => setVisibleSection(null)} />
			</div>
			<div className={classNames({ hidden: _.isNull(visibleSection), 'flex h-full': !_.isNull(visibleSection) })}>
				{content}
			</div>
		</div>
	);
};

const DesktopNavigation = ({ lang, region, languages, regions, currencies, navigation, translations }: NavbarProps) => {
	let { currency, setCurrency, setLanguage, setRegion } = useI18n();
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
		<div className="hidden h-20 flex-row items-baseline justify-between gap-x-4 overflow-hidden px-8 py-6 transition-[height] duration-500 ease-in group-hover/navbar:h-96 md:flex lg:group-hover/navbar:h-64">
			<div className="flex h-full flex-1 shrink-0 basis-1/4 flex-col">
				<Link href={`/${lang}/${region}`}>
					<SIAnimatedLogo className="mr-auto hidden h-6 lg:block" />
					<SIIcon className="-mb-2.5 block h-9 lg:hidden" />
				</Link>
				<div className="mt-6 hidden h-full flex-col justify-start group-hover/navbar:flex group-active/navbar:flex">
					<NavbarLink href={`/${lang}/${region}/me`}>{translations.myProfile}</NavbarLink>
					<div className="flex-inline mt-auto flex items-center space-x-2">
						<DonateIcon className="h-4 w-4" />
						<NavbarLink href={`/${lang}/${region}/donate/individual`} className="text-accent">
							{translations.donate}
						</NavbarLink>
					</div>
				</div>
			</div>
			<div
				className={classNames('flex max-w-[36rem] flex-1 basis-1/2 flex-row gap-x-2 overflow-visible', {
					// center the navbar links
					'lg:pl-12': lang === 'en',
					'lg:pl-4': lang === 'de',
					'lg:pl-8': lang === 'it',
				})}
			>
				<div className="group/our-work flex-1">
					<NavbarLink href={ourWork.href}>{ourWork.title}</NavbarLink>
					<div className="mt-6 hidden flex-col opacity-0 group-hover/navbar:flex group-hover/our-work:opacity-100">
						{ourWork.links?.map((link: any, index: number) => (
							<NavbarLink key={index} href={link.href}>
								{link.title}
							</NavbarLink>
						))}
					</div>
				</div>
				<div className="group/about-us flex-1">
					<NavbarLink href={aboutUs.href}>{aboutUs.title}</NavbarLink>
					<div className="mt-6 hidden flex-col opacity-0 group-hover/navbar:flex group-hover/about-us:opacity-100">
						{aboutUs.links?.map((link, index) => (
							<NavbarLink key={index} href={link.href}>
								{link.title}
							</NavbarLink>
						))}
					</div>
				</div>
				<div className="group/transparency flex-1">
					<NavbarLink href={transparency.href}>{transparency.title}</NavbarLink>
					<div className="mt-6 hidden flex-col opacity-0 group-hover/navbar:flex group-hover/transparency:opacity-100">
						{transparency.links?.map((link: any, index: number) => (
							<NavbarLink key={index} href={link.href}>
								{link.title}
							</NavbarLink>
						))}
					</div>
				</div>
			</div>
			<div className="group/i18n flex h-full flex-1 shrink-0 basis-1/4 flex-col">
				<div className="flex flex-row items-baseline justify-end">
					{Flag && <Flag className="m-auto mx-2 h-5 w-5 rounded-full" />}
					<Typography size="lg">{languages.find((l) => l.code === lang)?.translation}</Typography>
				</div>
				<div className="ml-auto mt-6 hidden h-full grid-cols-1 justify-items-start gap-2 text-left opacity-0 group-hover/navbar:grid group-hover/i18n:opacity-100 lg:grid-cols-[repeat(3,auto)] lg:justify-items-end lg:gap-8">
					<div className="flex w-full flex-col items-end">
						{regions
							.sort((a, b) => a.translation.localeCompare(b.translation))
							.map((reg, index) => (
								<Link
									key={index}
									href={`/${lang}/${reg.code}`}
									className={classNames('hover:active:text-accent text-left text-lg hover:cursor-pointer', {
										'text-accent': reg.code === region,
									})}
									onClick={() => setRegion(reg.code)}
								>
									{reg.translation}
								</Link>
							))}
					</div>
					<div className="flex w-full flex-col items-end">
						{languages
							.sort((a, b) => a.translation.localeCompare(b.translation))
							.map((l, index) => (
								<Typography
									key={index}
									className={classNames('hover:active:text-accent text-left text-lg hover:cursor-pointer', {
										'text-accent': l.code === lang,
									})}
									onClick={() => setLanguage(l.code)}
								>
									{l.translation}
								</Typography>
							))}
					</div>
					<div className="flex w-full flex-col items-end">
						{currencies
							.sort((a, b) => a.code.localeCompare(b.code))
							.map((curr, index) => (
								<Typography
									key={index}
									size="lg"
									className={classNames('hover:active:text-accent text-left text-lg hover:cursor-pointer', {
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

export function NavbarClient(props: NavbarProps) {
	const { backgroundColor } = useGlobalStateProvider();

	return (
		<nav className={twMerge('theme-blue group/navbar fixed inset-x-0 top-0 z-20 flex flex-col', backgroundColor)}>
			<DesktopNavigation {...props} />
			<MobileNavigation {...props} />
		</nav>
	);
}
