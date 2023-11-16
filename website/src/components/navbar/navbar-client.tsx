'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { I18nDialog } from '@/components/i18n-dialog';
import { SILogo } from '@/components/logos/si-logo';
import { SIIcon } from '@/components/logos/si-icon';
import { WebsiteCurrency } from '@/i18n';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { Bars3Icon, GlobeEuropeAfricaIcon, LanguageIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
	Button,
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
	Typography,
} from '@socialincome/ui';
import _ from 'lodash';
import Link from 'next/link';
import { useState } from 'react';

type NavigationSection = {
	title: string;
	href?: string;
	links?: {
		title: string;
		description?: string;
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

export function NavbarClient(
	{ lang, region, translations, languages, regions, currencies, navigation = [], showNavigation = true }: NavbarProps,
) {
	const [isOpen, setIsOpen] = useState(false);

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
		<nav className="min-h-navbar flex flex-col justify-start pt-4 py-8">
			<Collapsible
				open={isOpen}
				onOpenChange={setIsOpen}
				className="mx-auto flex w-screen max-w-6xl flex-col space-y-4 md:px-5"
			>
				<div className="flex flex-row items-center justify-between md:grid-cols-4 px-5 md:px-0">
					<Link href={`/${lang}/${region}`}>
						{/* Large Screen Logo */}
						<SILogo className="hidden lg:block h-6" />
						{/* Small Screen Icon */}
						<SIIcon className="block lg:hidden h-11" />
					</Link>
					{/*Desktop menu*/}
					{showNavigation && (
						<div className="mx-auto hidden md:col-span-2 md:flex md:items-center">
							{navigation.map((section, index) => {
								return (
									<div key={index}>
										{_.isEmpty(section.links) && section.href ? (
											<Link href={section.href} key={index}>
												<Button variant="ghost" className="text-gray-800 hover:text-black py-6">
													<Typography size="xl" weight="medium">
														{section.title}
													</Typography>
												</Button>
											</Link>
										) : (
											<HoverCard key={index} openDelay={0} closeDelay={200}>
												<HoverCardTrigger asChild>
													<Button variant="ghost" className="flex items-center space-x-2 py-6">
														<Typography size="xl" weight="medium" className="text-gray-800 hover:text-black">
															{section.title}
														</Typography>
														{(section.links?.length ?? 0) > 0 && (
															<ChevronDownIcon className="h-4 w-4" />
														)}
													</Button>
												</HoverCardTrigger>
												<HoverCardContent asChild alignOffset={20} className="bg-popover w-56 p-0">
													<ul  className="divide-y divide-gray-100">
														{section.links?.map((link, index) => (
															<li key={index} className="pl-10 py-2 hover:bg-accent">
																<Link href={link.href}>
																	<Typography size="xl" weight="medium" lineHeight="loose" className="text-gray-700 hover:text-black">
																		{link.title}
																	</Typography>
																</Link>
															</li>
														))}
													</ul>
												</HoverCardContent>
											</HoverCard>
										)}
									</div>
								);
							})}
						</div>
					)}
					<div className="hidden md:flex md:flex-row md:items-center md:justify-self-end">
						{i18nDialog}
						{showNavigation && (
							<Link href={`/${lang}/${region}/me`}>
								<Button variant="ghost" className="cursor-pointer py-6">
									<UserCircleIcon className="h-6 w-6" />
								</Button>
							</Link>
						)}
					</div>
					<div className="flex flex-row justify-self-end md:hidden">
						{i18nDialog}
						{showNavigation && (
							<CollapsibleTrigger asChild>
								<Button variant="ghost" size="icon" className="w-11 py-6">
									{isOpen ? (
										<XMarkIcon className="block h-6 w-6" aria-hidden="true" />
									) : (
										<Bars3Icon className="block h-6 w-6" aria-hidden="true" />
									)}
								</Button>
							</CollapsibleTrigger>
						)}
					</div>
				</div>

				{/*Mobile menu*/}
				<CollapsibleContent className="border-b md:hidden">
					<Accordion type="single" collapsible className="divide-y divide-gray-200 mb-0 flex w-full flex-col">
						{navigation.map((section, index) => (
							<div key={index}>
								{_.isEmpty(section.links) && section.href ? (
									// Entire section is a link with hover effect
									<Link href={section.href} className="flex flex-1 items-center justify-between py-4 text-lg font-medium px-5 md:px-0 hover:bg-accent">
										<span>{section.title}</span>
									</Link>
								) : (
									// Accordion section
									<AccordionItem value={`value-${index}`} className="divide-y divide-gray-200 border-none text-lg font-medium">
										<AccordionTrigger className=" pt-4 pr-8 pl-5 md:pl-0 hover:bg-accent hover:no-underline">{section.title}</AccordionTrigger>
										{section.links?.map((link, index2) => (
											<AccordionContent key={index2} className="px-10 md:px-0 text-lg pt-2 hover:bg-accent">
												<Link href={link.href} className="block mt-2">
													{link.title}
												</Link>
											</AccordionContent>
										))}
									</AccordionItem>
								)}
							</div>
						))}
						<Link href={`/${lang}/${region}/me`} className="block">
							<div className="flex flex-1 items-center justify-between px-5 md:px-0 py-4 text-lg font-medium hover:bg-accent">
								{translations.myProfile}
							</div>
						</Link>
					</Accordion>
				</CollapsibleContent>
			</Collapsible>
		</nav>
	);
}
