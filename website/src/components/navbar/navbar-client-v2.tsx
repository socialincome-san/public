'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { SIIcon } from '@/components/logos/si-icon';
import { SILogo } from '@/components/logos/si-logo';
import { WebsiteCurrency } from '@/i18n';
import { LanguageCode } from '@socialincome/shared/src/types/language';
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

	return (
		<nav
			className={classNames('theme-blue-v2 group/navbar bg-background fixed inset-x-0 top-0 z-20 flex flex-col', {
				'bg-transparent': transparent,
			})}
		>
			<div className="h-navbar flex flex-row items-stretch justify-between gap-4 overflow-hidden px-8 py-6 transition-[height] duration-500 ease-in group-hover/navbar:h-64">
				<div className="flex-1">
					<div className="flex flex-col">
						<SILogo className="hidden w-full max-w-48 md:block" onClick={() => setTransparent(!transparent)} />
						<SIIcon className="mr-auto block h-6 md:hidden" />
						<div className="mt-9 hidden group-hover/navbar:flex group-active/navbar:flex">
							<Link href={`/${lang}/${region}/v2/`} className="hover:text-accent">
								Journal
							</Link>
						</div>
					</div>
				</div>
				<div className="grid min-w-96 flex-1 grid-cols-3">
					<div className="group/about-us">
						<Link href={`/${lang}/${region}/v2`} className="hover:text-accent">
							About us
						</Link>
						<div className="mt-6 hidden flex-col text-left opacity-0 group-hover/navbar:flex group-hover/about-us:opacity-100">
							<Link href={`/${lang}/${region}/v2/`} className="hover:text-accent">
								Mission
							</Link>
							<Link href={`/${lang}/${region}/v2/`} className="hover:text-accent">
								People
							</Link>
							<Link href={`/${lang}/${region}/v2/`} className="hover:text-accent">
								Technology
							</Link>
							<Link href={`/${lang}/${region}/v2/`} className="hover:text-accent">
								Contact
							</Link>
						</div>
					</div>
					<div className="group/our-work">
						<Link href={`/${lang}/${region}/v2`} className="hover:text-accent">
							Our Work
						</Link>
						<div className="mt-6 hidden flex-col text-left opacity-0 group-hover/navbar:flex group-hover/our-work:opacity-100">
							<Link href={`/${lang}/${region}/v2/`} className="hover:text-accent">
								Fight Poverty
							</Link>
							<Link href={`/${lang}/${region}/v2/`} className="hover:text-accent">
								Cash Transfers
							</Link>
							<Link href={`/${lang}/${region}/v2/`} className="hover:text-accent">
								Basic Income
							</Link>
							<Link href={`/${lang}/${region}/v2/`} className="hover:text-accent">
								Active Programs
							</Link>
						</div>
					</div>
					<div className="group/transparency">
						<Link href={`/${lang}/${region}/v2`} className="hover:text-accent">
							Transparency
						</Link>
						<div className="mt-6 hidden flex-col text-left opacity-0 group-hover/navbar:flex group-hover/transparency:opacity-100">
							<Link href={`/${lang}/${region}/v2/`} className="hover:text-accent">
								Finances
							</Link>
							<Link href={`/${lang}/${region}/v2/`} className="hover:text-accent">
								Evidence
							</Link>
							<Link href={`/${lang}/${region}/v2/`} className="hover:text-accent">
								Recipient Selection
							</Link>
							<Link href={`/${lang}/${region}/v2/`} className="hover:text-accent">
								Open Source
							</Link>
							<Link href={`/${lang}/${region}/v2/`} className="hover:text-accent">
								Reports
							</Link>
							<Link href={`/${lang}/${region}/v2/`} className="hover:text-accent">
								FAQ
							</Link>
						</div>
					</div>
				</div>
				<div className="flex-1 text-right">
					<Link href={`/${lang}/${region}/v2`} className="hover:text-accent">
						Contact
					</Link>
				</div>
			</div>
		</nav>
	);
}
