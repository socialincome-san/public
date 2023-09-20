'use client';

import { DefaultParams } from '@/app/[lang]/[country]';
import { useTranslator } from '@/hooks/useTranslator';
import { LanguageIcon } from '@heroicons/react/24/solid';
import { LanguageCode } from '@socialincome/shared/src/types';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@socialincome/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

interface LanguageSwitcherProps {
	params: DefaultParams;
	languages?: LanguageCode[];
}

function LanguageSwitcherDropdown({ params, languages = ['en', 'de'] }: LanguageSwitcherProps) {
	const translator = useTranslator(params.lang, 'common');
	const router = useRouter();
	const searchParams = useSearchParams();

	const onLanguageChange = (lang: LanguageCode) => {
		const pathSegments = window.location.pathname.split('/');
		pathSegments[1] = lang;
		const current = new URLSearchParams(Array.from(searchParams.entries()));
		router.push(pathSegments.join('/') + '?' + current.toString());
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<LanguageIcon className="h-5 w-5" />
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuGroup>
					{languages.map((language, index) => (
						<DropdownMenuItem key={index} onClick={() => onLanguageChange(language)}>
							{translator?.t(`languages.${language}`)}
						</DropdownMenuItem>
					))}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function LanguageSwitcher(props: LanguageSwitcherProps) {
	return (
		<Suspense>
			<LanguageSwitcherDropdown {...props} />
		</Suspense>
	);
}
