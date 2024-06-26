'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { getFlagComponentByCurrency } from '@/components/country-flags';
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
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

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
	aboutUsLinks?: any;
	ourWorkLinks?: any;
	transparencyLinks?: any;
} & DefaultParams;

const MobileNavigation = ({
	lang,
	region,
	languages,
	regions,
	currencies,
	aboutUsLinks,
	transparencyLinks,
	ourWorkLinks,
}: NavbarProps) => {
	const [visibleSection, setVisibleSection] = useState<'main' | 'about-us' | null>(null);
	const NavbarLink = ({ href, children, className }: { href: string; children: string; className?: string }) => (
		<Link
			href={`/${lang}/${region}${href}`}
			className={classNames('hover:text-accent text-lg', className)}
			onClick={() => setVisibleSection(null)}
		>
			{children}
		</Link>
	);

	let content;
	switch (visibleSection) {
		case 'about-us':
			content = (
				<div className="flex flex-col space-y-4">
					{aboutUsLinks.map((link: any, index: number) => (
						<NavbarLink href={link.href} key={index}>
							{link.title}
						</NavbarLink>
					))}
				</div>
			);
			break;
		case 'main':
		default:
			content = (
				<div className="flex flex-col space-y-4">
					<Typography onClick={() => setVisibleSection('about-us')}>About Us</Typography>
				</div>
			);
			break;
	}

	return (
		<div
			className={classNames('flex flex-col px-4 py-5 md:hidden', {
				'bg-background h-screen': visibleSection,
				'h-16': !visibleSection,
			})}
		>
			<div className="flex flex-row justify-between">
				{visibleSection ? (
					<ChevronLeftIcon className="text-accent h-6 cursor-pointer" onClick={() => setVisibleSection(null)} />
				) : (
					<SILogo className="mr-auto h-6" />
				)}
				{visibleSection ? (
					<XMarkIcon className="text-accent h-6 cursor-pointer" onClick={() => setVisibleSection(null)} />
				) : (
					<Bars3Icon className="text-accent h-6 cursor-pointer" onClick={() => setVisibleSection('main')} />
				)}
			</div>
			<div className={classNames({ hidden: _.isNull(visibleSection), flex: !_.isNull(visibleSection) })}>{content}</div>
		</div>
	);
};
const DesktopNavigation = ({
	lang,
	region,
	languages,
	regions,
	currencies,
	aboutUsLinks,
	ourWorkLinks,
	transparencyLinks,
}: NavbarProps) => {
	let { currency, setCurrency } = useI18n();
	const Flag = getFlagComponentByCurrency(currency);
	const NavbarLink = ({ href, children, className }: { href: string; children: string; className?: string }) => (
		<Link href={`/${lang}/${region}${href}`} className={classNames('hover:text-accent text-lg', className)}>
			{children}
		</Link>
	);

	return (
		<div className="hidden h-20 flex-row items-baseline justify-between gap-4 overflow-hidden px-8 py-6 transition-[height] duration-500 ease-in group-hover/navbar:h-80 md:flex">
			<div className="flex h-full flex-shrink flex-grow-0 flex-col md:w-64">
				<div>
					<SILogo className="mr-auto hidden h-6 lg:block" />
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
			<div className="-ml-64 flex-1" />
			{/* Because the first column has flex-grow-0 */}
			<div className="flex min-w-96 flex-1 flex-row">
				<div className="group/about-us flex-1">
					<NavbarLink href={`/v2/about-us`}>About us</NavbarLink>
					<div className="mt-6 hidden flex-col opacity-0 group-hover/navbar:flex group-hover/about-us:opacity-100">
						{aboutUsLinks.map((link: any, index: number) => (
							<NavbarLink key={index} href={link.href}>
								{link.title}
							</NavbarLink>
						))}
					</div>
				</div>
				<div className="group/our-work flex-1">
					<NavbarLink href={`/v2`}>Our Work</NavbarLink>
					<div className="mt-6 hidden flex-col opacity-0 group-hover/navbar:flex group-hover/our-work:opacity-100">
						{ourWorkLinks.map((link: any, index: number) => (
							<NavbarLink key={index} href={link.href}>
								{link.title}
							</NavbarLink>
						))}
					</div>
				</div>
				<div className="group/transparency flex-1">
					<NavbarLink href={`/v2`}>Transparency</NavbarLink>
					<div className="mt-6 hidden flex-col opacity-0 group-hover/navbar:flex group-hover/transparency:opacity-100">
						{transparencyLinks.map((link: any, index: number) => (
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
	const pathname = usePathname();
	const { backgroundColor, setBackgroundColor } = useNavbarBackgroundColor();

	const aboutUsLinks = [
		{ title: 'Mission', href: '/v2/about-us' },
		{ title: 'People', href: '/v2/about-us' },
		{ title: 'Technology', href: '/v2/about-us' },
		{ title: 'Contact', href: '/v2/about-us' },
	];
	const ourWorkLinks = [
		{ title: 'Fight Poverty', href: '/v2' },
		{ title: 'Cash Transfers', href: '/v2' },
		{ title: 'Basic Income', href: '/v2' },
		{ title: 'Programs', href: '/v2' },
	];
	const transparencyLinks = [
		{ title: 'Finances', href: '/v2' },
		{ title: 'Evidence', href: '/v2' },
		{ title: 'Recipients', href: '/v2' },
		{ title: 'Open Source', href: '/v2' },
		{ title: 'Reports', href: '/v2' },
		{ title: 'FAQ', href: '/v2' },
	];

	useEffect(() => {
		if (pathname.split('/').length > 4) {
			setBackgroundColor('bg-background');
		}
	}, [pathname, setBackgroundColor]);

	return (
		<nav className={classNames('theme-blue-v2 group/navbar fixed inset-x-0 top-0 z-20 flex flex-col', backgroundColor)}>
			<DesktopNavigation
				{...props}
				aboutUsLinks={aboutUsLinks}
				ourWorkLinks={ourWorkLinks}
				transparencyLinks={transparencyLinks}
			/>
			<MobileNavigation
				{...props}
				aboutUsLinks={aboutUsLinks}
				ourWorkLinks={ourWorkLinks}
				transparencyLinks={transparencyLinks}
			/>
		</nav>
	);
}
