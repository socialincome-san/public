'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { I18nDialog } from '@/components/i18n-dialog';
import { SIIcon } from '@/components/logos/si-icon';
import { SILogo } from '@/components/logos/si-logo';
import { WebsiteCurrency } from '@/i18n';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { Bars3Icon, ChevronDownIcon, GlobeEuropeAfricaIcon, LanguageIcon, XMarkIcon } from '@heroicons/react/24/solid';
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

export function NavbarClient({
	lang,
	region,
	translations,
	languages,
	regions,
	currencies,
	navigation = [],
	showNavigation = true,
}: NavbarProps) {
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
		<nav className="min-h-navbar flex flex-col justify-start py-8 pt-4">
			<Collapsible
				open={isOpen}
				onOpenChange={setIsOpen}
				className="mx-auto flex w-screen max-w-6xl flex-col space-y-4 md:px-5"
			>
				<div className="flex flex-row items-center justify-between px-5 md:grid-cols-4 md:px-0">
					<Link href={`/${lang}/${region}`}>
						{/* Large Screen Logo */}
						<SILogo className="hidden h-6 lg:block" />
						{/* Small Screen Icon */}
						<SIIcon className="block h-11 lg:hidden" />
					</Link>
					{/*Desktop menu*/}
					{showNavigation && (
						<div className="mx-auto hidden md:col-span-2 md:flex md:items-center">
							{navigation.map((section, index) => {
								return (
									<div key={index}>
										{_.isEmpty(section.links) && section.href ? (
											<Link href={section.href} key={index}>
												<Button variant="ghost" className="py-6">
													<Typography size="xl">{section.title}</Typography>
												</Button>
											</Link>
										) : (
											<HoverCard key={index} openDelay={0} closeDelay={200}>
												<HoverCardTrigger asChild>
													<Button variant="ghost" className="flex items-center space-x-2 py-6">
														<Typography size="xl">{section.title}</Typography>
														{(section.links?.length ?? 0) > 0 && <ChevronDownIcon className="h-4 w-4" />}
													</Button>
												</HoverCardTrigger>
												<HoverCardContent asChild alignOffset={20} className="bg-popover w-56 p-0">
													<ul className="divide-muted divide-y">
														{section.links?.map((link, index) => (
															<li key={index} className="hover:bg-accent px-10 py-3">
																<Link href={link.href}>
																	<Typography size="xl" color="accent-foreground">
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
					<Accordion type="single" collapsible className="divide-border mb-0 flex w-full flex-col divide-y">
						{navigation.map((section, index) => (
							<div key={index}>
								{_.isEmpty(section.links) && section.href ? (
									// Entire section is a link with hover effect
									<Link
										href={section.href}
										className="hover:bg-accent flex flex-1 items-center justify-between px-5 py-4 text-lg font-medium md:px-0"
										onClick={() => setIsOpen(false)}
									>
										<span>{section.title}</span>
									</Link>
								) : (
									// Accordion section
									<AccordionItem
										value={`value-${index}`}
										className="divide-border divide-y border-none text-lg font-medium"
									>
										<AccordionTrigger className=" hover:bg-accent pl-5 pr-8 pt-4 hover:no-underline md:pl-0">
											{section.title}
										</AccordionTrigger>
										{section.links?.map((link, index2) => (
											<AccordionContent key={index2} className="hover:bg-accent px-10 pt-2 text-lg md:px-0">
												<Link href={link.href} className="mt-2 block" onClick={() => setIsOpen(false)}>
													{link.title}
												</Link>
											</AccordionContent>
										))}
									</AccordionItem>
								)}
							</div>
						))}
						<Link href={`/${lang}/${region}/me`} className="block" onClick={() => setIsOpen(false)}>
							<div className="hover:bg-accent flex flex-1 items-center justify-between px-5 py-4 text-lg font-medium md:px-0">
								{translations.myProfile}
							</div>
						</Link>
					</Accordion>
				</CollapsibleContent>
			</Collapsible>
		</nav>
	);
}
