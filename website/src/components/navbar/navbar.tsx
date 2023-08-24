'use client';

import { DefaultLayoutProps } from '@/app/[lang]/[country]';
import LanguageSwitcher from '@/components/language-switcher/language-switcher';
import { SILogo } from '@/components/logos/si-logo';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useTranslator } from '@/hooks/useTranslator';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, UserCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Typography } from '@socialincome/ui';
import classNames from 'classnames';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';

type NavbarProps = {
	backgroundColor?: string;
} & DefaultLayoutProps;

type NavbarItemProps = {
	text: string;
	href: string;
};

function NavbarItem({ text, href }: NavbarItemProps) {
	const pathname = usePathname();
	const active = href === pathname;

	return (
		<Link
			href={href}
			className={classNames('inline-flex items-center border-b-2  px-1 pt-1', {
				'border-primary': active,
				'hover:border-primary-content border-transparent': !active,
			})}
		>
			<Typography
				weight={active ? 'medium' : 'normal'}
				size="lg"
				color={active ? 'neutral' : 'neutral-focus'}
				className={classNames({ 'hover:text-base-content': !active })}
			>
				{text}
			</Typography>
		</Link>
	);
}

export default function Navbar({ params, backgroundColor }: NavbarProps) {
	const translator = useTranslator(params.lang, 'website-common');
	const [user, userIsReady] = useAuthUser();

	const ourWork = translator?.t('navigation.our-work');
	const ourWorkHref = `/${params.lang}/${params.country}/our-work`;
	const aboutUs = translator?.t('navigation.about-us');
	const aboutUsHref = `/${params.lang}/${params.country}/about-us`;
	const transparency = translator?.t('navigation.transparency');
	const transparencyHref = `/${params.lang}/${params.country}/transparency/usd`;

	return (
		<Disclosure as="nav" className={classNames(backgroundColor, 'pt-2 shadow')}>
			{({ open }) => (
				<>
					<div className="mx-auto max-w-7xl px-2 sm:px-5">
						<div className="flex h-16 justify-between">
							<div className="flex">
								<div className="-ml-2 mr-2 flex items-center md:hidden">
									{/* Mobile menu button */}
									<Disclosure.Button className="focus:ring-primary relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset">
										<span className="absolute -inset-0.5" />
										<span className="sr-only">Open main menu</span>
										{open ? (
											<XMarkIcon className="block h-6 w-6" aria-hidden="true" />
										) : (
											<Bars3Icon className="block h-6 w-6" aria-hidden="true" />
										)}
									</Disclosure.Button>
								</div>
								<div className="flex flex-shrink-0 items-center">
									<Link href={`/${params.lang}/${params.country}`}>
										<SILogo className="h-6" />
									</Link>
								</div>
							</div>
							<div className="hidden md:ml-6 md:flex md:space-x-8">
								<NavbarItem text={ourWork!} href={ourWorkHref} />
								<NavbarItem text={aboutUs!} href={aboutUsHref} />
								<NavbarItem text={transparency!} href={transparencyHref} />
							</div>
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<Suspense>
										<LanguageSwitcher params={params} />
									</Suspense>
								</div>
								<Link
									href={
										userIsReady && user
											? `/${params.lang}/${params.country}/me`
											: `/${params.lang}/${params.country}/me/login`
									}
								>
									<UserCircleIcon className="h-6 w-6" />
								</Link>
							</div>
						</div>
					</div>

					{/* Mobile menu */}
					{/*<Disclosure.Panel className="md:hidden">*/}
					{/*	<div className="space-y-1 pb-3 pt-2">*/}
					{/*		/!* Current: "bg-indigo-50 border-primary text-indigo-700", Default: "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700" *!/*/}
					{/*		<Disclosure.Button*/}
					{/*			as="a"*/}
					{/*			href="#"*/}
					{/*			className="border-primary block border-l-4 bg-indigo-50 py-2 pl-3 pr-4 text-base font-medium text-indigo-700 sm:pl-5 sm:pr-6"*/}
					{/*		>*/}
					{/*			Dashboard*/}
					{/*		</Disclosure.Button>*/}
					{/*		<Disclosure.Button*/}
					{/*			as="a"*/}
					{/*			href="#"*/}
					{/*			className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 sm:pl-5 sm:pr-6"*/}
					{/*		>*/}
					{/*			Team*/}
					{/*		</Disclosure.Button>*/}
					{/*		<Disclosure.Button*/}
					{/*			as="a"*/}
					{/*			href="#"*/}
					{/*			className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 sm:pl-5 sm:pr-6"*/}
					{/*		>*/}
					{/*			Projects*/}
					{/*		</Disclosure.Button>*/}
					{/*		<Disclosure.Button*/}
					{/*			as="a"*/}
					{/*			href="#"*/}
					{/*			className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 sm:pl-5 sm:pr-6"*/}
					{/*		>*/}
					{/*			Calendar*/}
					{/*		</Disclosure.Button>*/}
					{/*	</div>*/}
					{/*	<div className="border-t border-gray-200 pb-3 pt-4">*/}
					{/*		<div className="flex items-center px-4 sm:px-6">*/}
					{/*			<div className="flex-shrink-0">*/}
					{/*				<img className="h-10 w-10 rounded-full" src="" alt="" />*/}
					{/*			</div>*/}
					{/*			<div className="ml-3">*/}
					{/*				<div className="text-base font-medium text-gray-800">Tom Cook</div>*/}
					{/*				<div className="text-sm font-medium text-gray-500">tom@example.com</div>*/}
					{/*			</div>*/}
					{/*			<button*/}
					{/*				type="button"*/}
					{/*				className="focus:ring-primary relative ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2"*/}
					{/*			>*/}
					{/*				<span className="absolute -inset-1.5" />*/}
					{/*				<span className="sr-only">View notifications</span>*/}
					{/*				<BellIcon className="h-6 w-6" aria-hidden="true" />*/}
					{/*			</button>*/}
					{/*		</div>*/}
					{/*		<div className="mt-3 space-y-1">*/}
					{/*			<Disclosure.Button*/}
					{/*				as="a"*/}
					{/*				href="#"*/}
					{/*				className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6"*/}
					{/*			>*/}
					{/*				Your Profile*/}
					{/*			</Disclosure.Button>*/}
					{/*			<Disclosure.Button*/}
					{/*				as="a"*/}
					{/*				href="#"*/}
					{/*				className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6"*/}
					{/*			>*/}
					{/*				Settings*/}
					{/*			</Disclosure.Button>*/}
					{/*			<Disclosure.Button*/}
					{/*				as="a"*/}
					{/*				href="#"*/}
					{/*				className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6"*/}
					{/*			>*/}
					{/*				Sign out*/}
					{/*			</Disclosure.Button>*/}
					{/*		</div>*/}
					{/*	</div>*/}
					{/*</Disclosure.Panel>*/}
				</>
			)}
		</Disclosure>
	);
}
