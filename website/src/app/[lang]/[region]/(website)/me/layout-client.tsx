'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { UserContext } from '@/components/providers/user-context-provider';
import {
	ArrowPathIcon,
	BriefcaseIcon,
	CurrencyDollarIcon,
	DocumentIcon,
	ShieldCheckIcon,
	UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Button, Card, Collapsible, CollapsibleContent, CollapsibleTrigger, Typography } from '@socialincome/ui';
import { LinkProps } from 'next/dist/client/link';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { PropsWithChildren, useContext, useState } from 'react';
import { useAuth } from 'reactfire';

type NavigationLinkProps = {
	href: string;
	Icon: React.ForwardRefExoticComponent<React.PropsWithoutRef<React.SVGProps<SVGSVGElement>>>;
} & LinkProps;

function NavigationLink({ href, Icon, children, ...props }: PropsWithChildren<NavigationLinkProps>) {
	return (
		<Link href={href} {...props}>
			<li className="hover:bg-muted flex-inline flex items-center rounded px-4 py-3">
				<Icon className="mr-2 h-5 w-5" />
				<Typography>{children}</Typography>
			</li>
		</Link>
	);
}

function NavigationSectionTitle({ children }: PropsWithChildren) {
	return (
		<Typography weight="medium" className="py-2">
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
		donationCertificatesShort: string;
		donationCertificatesLong: string;
		employerTitle: string;
		work: string;
		emailLoginRequired: string;
	};
};

export function LayoutClient({ params, translations, children }: PropsWithChildren<LayoutClientProps>) {
	const pathname = usePathname();
	const user = useContext(UserContext);
	const [isOpen, setIsOpen] = useState(false);
	const auth = useAuth();

	const navigationMenu = (
		<ul className="pr-4">
			<NavigationSectionTitle>{translations.contributionsTitle}</NavigationSectionTitle>
			<NavigationLink
				href={`/${params.lang}/${params.region}/me/contributions`}
				Icon={CurrencyDollarIcon}
				onClick={() => setIsOpen(false)}
			>
				{translations.payments}
			</NavigationLink>
			<NavigationLink
				href={`/${params.lang}/${params.region}/me/subscriptions`}
				Icon={ArrowPathIcon}
				onClick={() => setIsOpen(false)}
			>
				{translations.subscriptions}
			</NavigationLink>
			{user?.get('address.country') === 'CH' && (
				<NavigationLink
					href={`/${params.lang}/${params.region}/me/donation-certificates`}
					Icon={DocumentIcon}
					onClick={() => setIsOpen(false)}
				>
					{translations.donationCertificatesShort}
				</NavigationLink>
			)}
			<NavigationSectionTitle>{translations.employerTitle}</NavigationSectionTitle>
			<NavigationLink
				href={`/${params.lang}/${params.region}/me/work-info`}
				Icon={BriefcaseIcon}
				onClick={() => setIsOpen(false)}
			>
				{translations.work}
			</NavigationLink>
			<NavigationSectionTitle>{translations.accountTitle}</NavigationSectionTitle>
			<NavigationLink
				href={`/${params.lang}/${params.region}/me/personal-info`}
				Icon={UserCircleIcon}
				onClick={() => setIsOpen(false)}
			>
				{translations.personalInfo}
			</NavigationLink>
			{!auth.currentUser?.isAnonymous && (
				<NavigationLink
					href={`/${params.lang}/${params.region}/me/security`}
					Icon={ShieldCheckIcon}
					onClick={() => setIsOpen(false)}
				>
					{translations.security}
				</NavigationLink>
			)}
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
		case `/${params.lang}/${params.region}/me/contributions`:
			title = translations.payments;
			break;
		case `/${params.lang}/${params.region}/me/subscriptions`:
			title = translations.subscriptions;
			break;
		case `/${params.lang}/${params.region}/me/donation-certificates`:
			title = translations.donationCertificatesLong;
	}

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5">
			<div className="hidden pt-12 md:col-span-1 md:flex lg:col-span-1">{navigationMenu}</div>
			<div className="md:col-span-3 lg:col-span-4">
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
				{auth.currentUser?.isAnonymous && (
					<Card className="mb-12">
						<Typography className="m-4" dangerouslySetInnerHTML={{ __html: translations.emailLoginRequired }} />
					</Card>
				)}
				<Typography size="2xl" weight="medium" className="-mt-10 mb-4 md:mt-0">
					{title}
				</Typography>
				{children}
			</div>
		</Collapsible>
	);
}
