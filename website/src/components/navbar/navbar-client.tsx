'use client';

import { SILogo } from '@/components/logos/si-logo';
import { useAuthUser } from '@/hooks/useAuthUser';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, UserCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { LanguageIcon } from '@heroicons/react/24/solid';
import { Language } from '@socialincome/shared/src/types';
import { Button, Dropdown, Menu, Typography } from '@socialincome/ui';
import classNames from 'classnames';
import _ from 'lodash';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

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
	};
	languages: {
		code: Language;
		translation: string;
	}[];
};

export default function NavbarClient({ translations, languages, sections = [] }: NavbarProps) {
	const [authUser, authUserReady] = useAuthUser();
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const baseSegment = pathname?.split('/')[3];
	let backgroundColor;

	switch (baseSegment) {
		case 'about-us':
			backgroundColor = 'bg-neutral-100';
			break;
		default:
			backgroundColor = 'bg-base-blue';
	}

	const onLanguageChange = (lang: Language) => {
		const pathSegments = window.location.pathname.split('/');
		pathSegments[1] = lang;
		const current = new URLSearchParams(Array.from(searchParams.entries()));
		router.push(pathSegments.join('/') + '?' + current.toString());
	};

	return (
		<Disclosure as="nav" className={classNames(backgroundColor, 'pt-2 shadow')}>
			{({ open }) => (
				<>
					<div className="mx-auto max-w-7xl px-2 sm:px-5">
						<div className="flex h-16 justify-between">
							<div className="flex flex-shrink-0 items-center">
								<Link href="/">
									<SILogo className="h-6" />
								</Link>
							</div>
							<div className="hidden items-center md:ml-6 md:flex md:space-x-4">
								{sections.map((section, index) => {
									const active = _.isString(section.href) && pathname.startsWith(section.href);
									const linkClassNames = classNames(
										'inline-flex items-center border-b-2 py-4 justify-center min-w-[8rem]',
										{
											'border-primary': active,
											'hover:border-primary-content border-transparent': !active,
										},
									);

									if (_.isEmpty(section.links)) {
										return (
											<Link key={index} href={section.href} className={linkClassNames}>
												<Typography
													weight={active ? 'medium' : 'normal'}
													size="lg"
													color={active ? 'neutral' : 'neutral-focus'}
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
												<Dropdown.Menu className="z-40 w-full">
													{section.links!.map((link, index) => (
														<Dropdown.Item key={index} anchor={false}>
															<Link href={link.href}>{link.text}</Link>
														</Dropdown.Item>
													))}
												</Dropdown.Menu>
											</Dropdown>
										);
									}
								})}
							</div>

							<div className="hidden items-center md:flex">
								<Dropdown hover end>
									<Dropdown.Toggle color="ghost" className="hover:bg-none">
										<LanguageIcon className="h-5 w-5" />
									</Dropdown.Toggle>
									<Dropdown.Menu className="z-40">
										{languages.map((lang, index) => (
											<Dropdown.Item key={index} onClick={() => onLanguageChange(lang.code)}>
												{lang.translation}
											</Dropdown.Item>
										))}
									</Dropdown.Menu>
								</Dropdown>
								<Button color="ghost">
									<Link href={authUserReady && authUser ? '/me' : '/me/login'}>
										<UserCircleIcon className="h-6 w-6" />
									</Link>
								</Button>
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
									<Menu.Details
										label={
											<div className="flex-inline flex space-x-2">
												<LanguageIcon className="h-5 w-5" />
												<Typography size="sm">{translations.currentLanguage}</Typography>
											</div>
										}
									>
										{languages.map((lang, index) => (
											<Menu.Item key={index}>
												<a onClick={() => onLanguageChange(lang.code)}>{lang.translation}</a>
											</Menu.Item>
										))}
									</Menu.Details>
								</Menu.Item>
								<Menu.Item>
									<Link href={authUserReady && authUser ? '/me' : '/me/login'}>
										<UserCircleIcon className="h-5 w-5" />
										<Typography size="sm">{translations.myProfile}</Typography>
									</Link>
								</Menu.Item>
							</Menu>
						</div>
					</Disclosure.Panel>
				</>
			)}
		</Disclosure>
	);
}
