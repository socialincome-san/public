'use client';

import { DefaultParams } from '@/app/[lang]/[country]';
import { SILogo } from '@/components/logos/si-logo';
import { LanguageSwitcher } from '@/components/navbar/language-switcher';
import { Language } from '@socialincome/shared/src/types';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from '@socialincome/ui';

import { UserCircleIcon } from '@heroicons/react/24/outline';
import { signOut } from 'firebase/auth';
import _ from 'lodash';
import Link from 'next/link';
import { useAuth, useUser } from 'reactfire';

type NavbarSection = {
	title: string;
	href: string;
	links?: {
		text: string;
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
		code: Language;
		translation: string;
	}[];
} & DefaultParams;

export function NavbarClient({ lang, country, translations, languages, sections = [] }: NavbarProps) {
	const auth = useAuth();
	const { status: authUserReady, data: authUser } = useUser();

	return (
		<NavigationMenu className="mx-auto h-20 w-screen max-w-6xl justify-between">
			<div className="flex flex-shrink-0 items-center">
				<Link href={`/${lang}/${country}`}>
					<SILogo className="h-6" />
				</Link>
			</div>
			<NavigationMenuList>
				{sections.map((section, index) => {
					return (
						<NavigationMenuItem key={index}>
							{_.isEmpty(section.links) ? (
								<Link href={section.href} legacyBehavior passHref>
									<NavigationMenuLink className={navigationMenuTriggerStyle()}>{section.title}</NavigationMenuLink>
								</Link>
							) : (
								<>
									<NavigationMenuTrigger>{section.title}</NavigationMenuTrigger>
									<NavigationMenuContent>
										<ul className="grid gap-3 p-4 ">
											{section.links?.map((link, index) => (
												<li key={index} className="row-span-3">
													<Link href={link.href} legacyBehavior passHref>
														<NavigationMenuLink className={navigationMenuTriggerStyle()}>
															{link.text}
														</NavigationMenuLink>
													</Link>
												</li>
											))}
										</ul>
									</NavigationMenuContent>
								</>
							)}
						</NavigationMenuItem>
					);
				})}
			</NavigationMenuList>
			<div className="flex flex-row items-center space-x-4">
				<LanguageSwitcher languages={languages} mobile={false} currentLanguage={translations.currentLanguage} />
				<DropdownMenu>
					<DropdownMenuTrigger>
						<UserCircleIcon className="h-5 w-5" />
					</DropdownMenuTrigger>
					<DropdownMenuContent className="z-40 min-w-[6rem]">
						{authUserReady === 'success' && authUser ? (
							<>
								<DropdownMenuItem>
									<Link href={`/${lang}/${country}/me/contributions`}>{translations.payments}</Link>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Link href={`/${lang}/${country}/me/contact-details`}>{translations.contactDetails}</Link>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => signOut(auth)}>{translations.signOut}</DropdownMenuItem>
							</>
						) : (
							<DropdownMenuItem>
								<Link href={`/${lang}/${country}/login`}>Log in</Link>
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</NavigationMenu>
	);
}
