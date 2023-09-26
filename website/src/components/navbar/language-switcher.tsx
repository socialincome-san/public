'use client';

import { LanguageIcon } from '@heroicons/react/24/solid';
import { LanguageCode } from '@socialincome/shared/src/types/Language';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarTrigger,
} from '@socialincome/ui';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { ReadonlyURLSearchParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

type LanguageSwitcherProps = {
	mobile?: boolean;
	currentLanguage: string;
	languages: {
		code: LanguageCode;
		translation: string;
	}[];
};

export function onLanguageChange(lang: LanguageCode, router: AppRouterInstance, searchParams: ReadonlyURLSearchParams) {
	const pathSegments = window.location.pathname.split('/');
	pathSegments[1] = lang;
	const current = new URLSearchParams(Array.from(searchParams.entries()));
	router.push(pathSegments.join('/') + '?' + current.toString());
}

function LanguageSwitcherComponent({ languages, mobile, currentLanguage }: LanguageSwitcherProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	if (mobile) {
		return (
			<Accordion type="single" collapsible className="w-full">
				<AccordionItem value="item-1">
					<AccordionTrigger>
						<div>
							<LanguageIcon className="h-5 w-5" />
						</div>
					</AccordionTrigger>
					{languages.map((lang, index) => (
						<AccordionContent key={index} onClick={() => onLanguageChange(lang.code, router, searchParams)}>
							{lang.translation}
						</AccordionContent>
					))}
				</AccordionItem>
			</Accordion>
		);
	} else {
		return (
			<MenubarMenu>
				<MenubarTrigger className="cursor-pointer">
					<LanguageIcon className="h-5 w-5" />
				</MenubarTrigger>
				<MenubarContent>
					{languages.map((lang, index) => (
						<MenubarItem key={index} onClick={() => onLanguageChange(lang.code, router, searchParams)}>
							{lang.translation}
						</MenubarItem>
					))}
				</MenubarContent>
			</MenubarMenu>
		);
	}
}

export function LanguageSwitcher(props: LanguageSwitcherProps) {
	return (
		<Suspense>
			<LanguageSwitcherComponent {...props} />
		</Suspense>
	);
}
