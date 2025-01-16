'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger, Typography } from '@socialincome/ui';
import { LinkProps } from 'next/dist/client/link';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { PropsWithChildren, useState } from 'react';

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
		title: string;
		privacyTitle: string;
		termsOfUseTitle: string;
		termsAndConditionsTitle: string;
		fundraisersTitle: string;
	};
};

export function LayoutClient({ params, translations, children }: PropsWithChildren<LayoutClientProps>) {
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);

	const navigationMenu = (
		<ul className="pr-4">
			<NavigationSectionTitle>{translations.title}</NavigationSectionTitle>
			<NavigationLink
				href={`/${params.lang}/${params.region}/legal/privacy`}
				Icon={DocumentTextIcon}
				onClick={() => setIsOpen(false)}
			>
				{translations.privacyTitle}
			</NavigationLink>
			<NavigationLink
				href={`/${params.lang}/${params.region}/legal/site-use`}
				Icon={DocumentTextIcon}
				onClick={() => setIsOpen(false)}
			>
				{translations.termsOfUseTitle}
			</NavigationLink>
			<NavigationLink
				href={`/${params.lang}/${params.region}/legal/donations`}
				Icon={DocumentTextIcon}
				onClick={() => setIsOpen(false)}
			>
				{translations.termsAndConditionsTitle}
			</NavigationLink>
			<NavigationLink
				href={`/${params.lang}/${params.region}/legal/fundraisers`}
				Icon={DocumentTextIcon}
				onClick={() => setIsOpen(false)}
			>
				{translations.fundraisersTitle}
			</NavigationLink>
		</ul>
	);

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5">
			<div className="hidden md:col-span-1 md:flex lg:col-span-1">{navigationMenu}</div>
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
				{children}
			</div>
		</Collapsible>
	);
}
