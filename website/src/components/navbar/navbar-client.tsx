'use client';
import { DefaultParams } from '@/app/[lang]/[country]';
import { SILogo } from '@/components/logos/si-logo';
import { LanguageSwitcher } from '@/components/navbar/language-switcher';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { LanguageCode } from '@socialincome/shared/src/types/Language';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
	Button,
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarTrigger,
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	Typography,
	navigationMenuTriggerStyle,
} from '@socialincome/ui';
import { signOut } from 'firebase/auth';
import _ from 'lodash';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth, useUser } from 'reactfire';

type NavbarSection = {
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
	sections: NavbarSection[];
	translations: {
		currentLanguage: string;
		myProfile: string;
		contactDetails: string;
		payments: string;
		signOut: string;
	};
	languages: {
		code: LanguageCode;
		translation: string;
	}[];
} & DefaultParams;

export function NavbarClient({ lang, country, translations, languages, sections = [] }: NavbarProps) {
	const auth = useAuth();
	const [isOpen, setIsOpen] = useState(false);

	const { status: authUserReady, data: authUser } = useUser();

	return (
		<NavigationMenu className="mx-auto md:h-20">
			<Collapsible
				open={isOpen}
				onOpenChange={setIsOpen}
				className="flex w-screen max-w-6xl flex-col space-y-4 px-3 py-2 md:px-5 md:py-4"
			>
				<div className="grid grid-cols-2 items-center md:grid-cols-4">
					<Link href={`/${lang}/${country}`}>
						<SILogo className="h-6" />
					</Link>
					<div className="mx-auto hidden md:col-span-2 md:flex md:items-center">
						<NavigationMenuList>
							{sections.map((section, index) => {
								return (
									<NavigationMenuItem key={index}>
										{_.isEmpty(section.links) && section.href ? (
											<Link href={section.href} legacyBehavior passHref>
												<NavigationMenuLink className={navigationMenuTriggerStyle()}>
													{section.title}
												</NavigationMenuLink>
											</Link>
										) : (
											<div key={index}>
												<NavigationMenuTrigger>{section.title}</NavigationMenuTrigger>
												<NavigationMenuContent>
													<ul className="grid w-[40rem] grid-cols-2 gap-2 p-4">
														{section.links?.map((link, index) => (
															<li key={index} className="hover:bg-accent rounded p-2">
																<Link href={link.href}>
																	<Typography size="md" weight="medium" lineHeight="loose">
																		{link.title}
																	</Typography>
																	{link.description && <Typography size="xs">{link.description}</Typography>}
																</Link>
															</li>
														))}
													</ul>
												</NavigationMenuContent>
											</div>
										)}
									</NavigationMenuItem>
								);
							})}
						</NavigationMenuList>
					</div>
					<div className="hidden md:flex md:flex-row md:items-center md:justify-self-end">
						<Menubar className="border-none">
							<LanguageSwitcher languages={languages} mobile={false} currentLanguage={translations.currentLanguage} />
							<MenubarMenu>
								<MenubarTrigger className="cursor-pointer">
									<UserCircleIcon className="h-5 w-5" />
								</MenubarTrigger>
								<MenubarContent>
									{authUserReady === 'success' && authUser ? (
										<>
											<MenubarItem>
												<Link href={`/${lang}/${country}/me/contributions`}>{translations.payments}</Link>
											</MenubarItem>
											<MenubarItem>
												<Link href={`/${lang}/${country}/me/contact-details`}>{translations.contactDetails}</Link>
											</MenubarItem>
											<MenubarItem>
												<a onClick={() => signOut(auth)}>{translations.signOut}</a>
											</MenubarItem>
										</>
									) : (
										<MenubarItem>
											<Link href={`/${lang}/${country}/login`}>Log in</Link>
										</MenubarItem>
									)}
								</MenubarContent>
							</MenubarMenu>
						</Menubar>
					</div>
					<CollapsibleTrigger asChild className="justify-self-end md:hidden">
						<Button variant="ghost" size="icon" className="w-9 p-0">
							{isOpen ? (
								<XMarkIcon className="block h-5 w-5" aria-hidden="true" />
							) : (
								<Bars3Icon className="block h-5 w-5" aria-hidden="true" />
							)}
						</Button>
					</CollapsibleTrigger>
				</div>
				<CollapsibleContent className="space-y-2 md:hidden">
					<Accordion type="single" collapsible className="w-full">
						{sections.map((section, index) => (
							<div key={index}>
								{_.isEmpty(section.links) && section.href ? (
									<Link href={section.href}>{section.title}</Link>
								) : (
									<AccordionItem value={`value-${index}`} className="border-none">
										<AccordionTrigger>{section.title}</AccordionTrigger>
										{section.links?.map((link, index2) => (
											<AccordionContent key={index2}>
												<Link href={link.href}>{link.title}</Link>
											</AccordionContent>
										))}
									</AccordionItem>
								)}
							</div>
						))}
					</Accordion>
					<LanguageSwitcher languages={languages} mobile={true} currentLanguage={translations.currentLanguage} />
				</CollapsibleContent>
			</Collapsible>
		</NavigationMenu>
	);
}
