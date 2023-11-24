'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { ArrowPathIcon, CurrencyDollarIcon, ShieldCheckIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger, Typography } from '@socialincome/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { PropsWithChildren, useState } from 'react';

type NavigationLinkProps = {
	href: string;
	Icon: React.ForwardRefExoticComponent<React.PropsWithoutRef<React.SVGProps<SVGSVGElement>>>;
};

function NavigationLink({ href, Icon, children }: PropsWithChildren<NavigationLinkProps>) {
	return (
		<Link href={href}>
			<li className="hover:bg-accent flex-inline flex items-center rounded px-4 py-3">
				<Icon className="mr-2 h-5 w-5" />
				<Typography>{children}</Typography>
			</li>
		</Link>
	);
}

function NavigationSectionTitle({ children }: PropsWithChildren) {
	return (
		<Typography weight="semibold" className="py-2">
			{children}
		</Typography>
	);
}

type LayoutClientProps = {
	params: DefaultParams;
	translations: {
		accountTitle: string;
		personalInfo: string;
		security: string;
		contributionsTitle: string;
		payments: string;
		subscriptions: string;
	};
};

export function LayoutClient({ params, translations, children }: PropsWithChildren<LayoutClientProps>) {
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);

	const navigationMenu = (
		<ul className="pr-4">
			<NavigationSectionTitle>{translations.contributionsTitle}</NavigationSectionTitle>
			<NavigationLink href={`/${params.lang}/${params.region}/me/payments`} Icon={CurrencyDollarIcon}>
				{translations.payments}
			</NavigationLink>
			<NavigationLink href={`/${params.lang}/${params.region}/me/subscriptions`} Icon={ArrowPathIcon}>
				{translations.subscriptions}
			</NavigationLink>
			<NavigationSectionTitle>{translations.accountTitle}</NavigationSectionTitle>
			<NavigationLink href={`/${params.lang}/${params.region}/me/personal-info`} Icon={UserCircleIcon}>
				{translations.personalInfo}
			</NavigationLink>
			<NavigationLink href={`/${params.lang}/${params.region}/me/security`} Icon={ShieldCheckIcon}>
				{translations.security}
			</NavigationLink>
		</ul>
	);

	let title;
	switch (pathname) {
		case `/${params.lang}/${params.region}/me/personal-info`:
			title = translations.personalInfo;
			break;
		case `/${params.lang}/${params.region}/me/security`:
			title = translations.security;
			break;
		case `/${params.lang}/${params.region}/me/payments`:
			title = translations.payments;
			break;
		case `/${params.lang}/${params.region}/me/subscriptions`:
			title = translations.subscriptions;
			break;
	}

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5">
			<div className="hidden pt-16 md:col-span-1 md:flex lg:col-span-1">{navigationMenu}</div>
			<div className="mt-4 md:col-span-3 lg:col-span-4">
				<CollapsibleTrigger asChild>
					<div className="flex justify-end md:hidden">
						<Button
							variant="ghost"
							size="sm"
							className="inline-flex items-center text-sm underline"
							onClick={() => setIsOpen((isOpen) => !isOpen)}
						>
							{isOpen ? 'Hide Menu' : 'Show Menu'}
						</Button>
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent className="-mt-10 mb-12 border-b md:hidden">{isOpen && navigationMenu}</CollapsibleContent>
				<Typography size="2xl" weight="semibold" className="-mt-10 mb-4 md:mt-0">
					{title}
				</Typography>
				{children}
			</div>
		</Collapsible>
	);
}
