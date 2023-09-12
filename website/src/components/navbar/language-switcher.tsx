'use client';

import { LanguageIcon } from '@heroicons/react/24/solid';
import { Language } from '@socialincome/shared/src/types';
import { Dropdown, Menu, Theme, Typography } from '@socialincome/ui';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';
import { useRouter, useSearchParams, ReadonlyURLSearchParams } from 'next/navigation';
import { Suspense } from 'react';

type LanguageSwitcherProps = {
	mobile?: boolean;
	currentLanguage: string;
	languages: {
		code: Language;
		translation: string;
	}[];
};

export function onLanguageChange(lang: Language, router: AppRouterInstance, searchParams: ReadonlyURLSearchParams) {
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
			<Menu.Details
				label={
					<div className="flex-inline flex space-x-2">
						<LanguageIcon className="h-5 w-5" />
						<Typography size="sm">{currentLanguage}</Typography>
					</div>
				}
			>
				{languages.map((lang, index) => (
					<Menu.Item key={index}>
						<a onClick={() => onLanguageChange(lang.code, router, searchParams)}>{lang.translation}</a>
					</Menu.Item>
				))}
			</Menu.Details>
		);
	} else {
		return (
			<Dropdown hover end>
				<Dropdown.Toggle color="ghost" className="hover:bg-none">
					<LanguageIcon className="h-5 w-5" />
				</Dropdown.Toggle>
				<Theme dataTheme="siDefault">
					<Dropdown.Menu className="z-40 min-w-[6rem]">
						{languages.map((lang, index) => (
							<Dropdown.Item key={index} onClick={() => onLanguageChange(lang.code, router, searchParams)}>
								{lang.translation}
							</Dropdown.Item>
						))}
					</Dropdown.Menu>
				</Theme>
			</Dropdown>
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
