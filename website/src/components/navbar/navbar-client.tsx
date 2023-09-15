'use client';
import { SILogo } from '@/components/logos/si-logo';
import { DefaultParams } from '@/app/[lang]/[country]';
import { LanguageSwitcher } from '@/components/navbar/language-switcher';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, UserCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Language } from '@socialincome/shared/src/types';
import { Button, Dropdown, Menu, Theme, Typography } from '@socialincome/ui';
import classNames from 'classnames';
import { signOut } from 'firebase/auth';
import _ from 'lodash';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

export default function NavbarClient({ lang, country, translations, languages, sections = [] }: NavbarProps) {
	const auth = useAuth();
	const { status: authUserReady, data: authUser } = useUser();
	const pathname = usePathname();

	return (
		<Disclosure as="nav" className="pt-2">
			{({ open }) => (
				<>
					<div className="mx-auto max-w-6xl px-2 sm:px-5">
						<div className="flex h-16 justify-between">
							<div className="flex flex-shrink-0 items-center">
								<Link href={`/${lang}/${country}`}>
									<SILogo className="h-6" />
								</Link>
							</div>
							<div className="hidden items-center md:ml-6 md:flex md:space-x-4">
								{sections.map((section, index) => {
									const active = _.isString(section.href) && pathname.startsWith(section.href);
									const linkClassNames = classNames(
										'inline-flex items-center border-b-2 py-4 justify-center min-w-[8rem]',
										{
											'border-accent': active,
											'hover:border-neutral-content border-transparent': !active,
										},
									);

									if (_.isEmpty(section.links)) {
										return (
											<Link key={index} href={section.href} className={linkClassNames}>
												<Typography
													weight={active ? 'medium' : 'normal'}
													size="lg"
													className={classNames({ 'hover:text-base-content': !active })}
												>
													{section.title}
												</Typography>
											</Link>
										);
									} else {
										return (
											<Dropdown key={index} hover>
												<Link href={section.href} className={linkClassNames}>
													<Typography size="lg" weight={active ? 'medium' : 'normal'}>
														{section.title}
													</Typography>
												</Link>
												<Theme dataTheme="siDefault">
													<Dropdown.Menu className="z-40 w-full">
														{section.links!.map((link, index) => (
															<Dropdown.Item key={index} anchor={false}>
																<Link href={link.href}>{link.text}</Link>
															</Dropdown.Item>
														))}
													</Dropdown.Menu>
												</Theme>
											</Dropdown>
										);
									}
								})}
							</div>

							<div className="hidden items-center md:flex">
								<LanguageSwitcher languages={languages} mobile={false} currentLanguage={translations.currentLanguage} />
								<Dropdown hover end>
									<Dropdown.Toggle color="ghost" className="hover:bg-none">
										<UserCircleIcon className="h-6 w-6" />
									</Dropdown.Toggle>
									<Theme dataTheme="siDefault">
										<Dropdown.Menu className="z-40 min-w-[6rem]">
											{authUserReady === 'success' && authUser ? (
												<>
													<Dropdown.Item anchor={false}>
														<Link href={`/${lang}/${country}/me/contributions`}>{translations.payments}</Link>
													</Dropdown.Item>
													<Dropdown.Item anchor={false}>
														<Link href={`/${lang}/${country}/me/contact-details`}>{translations.contactDetails}</Link>
													</Dropdown.Item>
													<Dropdown.Item className="border-t" onClick={() => signOut(auth)}>
														{translations.signOut}
													</Dropdown.Item>
												</>
											) : (
												<Dropdown.Item anchor={false}>
													<Link href={`/${lang}/${country}/login`}>Log in</Link>
												</Dropdown.Item>
											)}
										</Dropdown.Menu>
									</Theme>
								</Dropdown>
							</div>

							{/* Mobile menu button */}
							<div className="flex items-center md:hidden">
								<Disclosure.Button
									as={Button}
									color="ghost"
									size="sm"
									className="relative inline-flex items-center justify-center px-2"
								>
									{open ? (
										<XMarkIcon className="block h-6 w-6" aria-hidden="true" />
									) : (
										<Bars3Icon className="block h-6 w-6" aria-hidden="true" />
									)}
								</Disclosure.Button>
							</div>
						</div>
					</div>

					{/* Mobile menu */}
					<Disclosure.Panel className="md:hidden">
						<Menu>
							{sections.map((section, index) => (
								<Menu.Item key={index}>
									{_.size(section.links) > 0 ? (
										<Menu.Details label={<Typography size="sm">{section.title}</Typography>}>
											{section.links?.map((link, index2) => (
												<Menu.Item key={index2}>
													<Link href={link.href}>
														<Typography size="sm">{link.text}</Typography>
													</Link>
												</Menu.Item>
											))}
										</Menu.Details>
									) : (
										<Link href={section.href!}>
											<Typography size="sm">{section.title}</Typography>
										</Link>
									)}
								</Menu.Item>
							))}
						</Menu>

						<div className="neutral-content border-t pb-3 pt-4">
							<Menu>
								<Menu.Item>
									<LanguageSwitcher
										languages={languages}
										mobile={true}
										currentLanguage={translations.currentLanguage}
									/>
								</Menu.Item>
								<Menu.Item>
									<Menu.Details
										label={
											<div className="flex-inline flex space-x-2">
												<UserCircleIcon className="h-5 w-5" />
												<Typography size="sm">{translations.myProfile}</Typography>
											</div>
										}
									>
										{authUserReady === 'success' && authUser ? (
											<>
												<Menu.Item>
													<Link href={`/${lang}/${country}/me/contact-details`}>{translations.contactDetails}</Link>
												</Menu.Item>
												<Menu.Item>
													<Link href={`/${lang}/${country}/me/contributions`}>{translations.payments}</Link>
												</Menu.Item>
												<Menu.Item>
													<a onClick={() => signOut(auth)}>{translations.signOut}</a>
												</Menu.Item>
											</>
										) : (
											<Menu.Item>
												<Link href={`/${lang}/${country}/login`}>Log in</Link>
											</Menu.Item>
										)}
									</Menu.Details>
								</Menu.Item>
							</Menu>
						</div>
					</Disclosure.Panel>
				</>
			)}
		</Disclosure>
	);
}
