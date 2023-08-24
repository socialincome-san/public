'use client';

import { DefaultParams } from '@/app/[lang]/[country]';
import { useTranslator } from '@/hooks/useTranslator';
import { LanguageIcon } from '@heroicons/react/24/solid';
import { Language } from '@socialincome/shared/src/types';
import { Dropdown } from '@socialincome/ui';
import { useRouter, useSearchParams } from 'next/navigation';

interface LanguageSwitcherProps {
	params: DefaultParams;
	languages?: Language[];
}

export default function LanguageSwitcher({ params, languages = ['en', 'de'] }: LanguageSwitcherProps) {
	const translator = useTranslator(params.lang, 'common');
	const router = useRouter();
	const searchParams = useSearchParams();

	const onLanguageChange = (lang: Language) => {
		const pathSegments = window.location.pathname.split('/');
		pathSegments[1] = lang;
		const current = new URLSearchParams(Array.from(searchParams.entries()));
		router.push(pathSegments.join('/') + '?' + current.toString());
	};

	return (
		<Dropdown hover end>
			<Dropdown.Toggle color="ghost" className="hover:bg-none">
				<LanguageIcon className="h-5 w-5" />
			</Dropdown.Toggle>
			<Dropdown.Menu className="z-40">
				{languages.map((language, index) => (
					<Dropdown.Item key={index} onClick={() => onLanguageChange(language)}>
						{translator?.t(`languages.${language}`)}
					</Dropdown.Item>
				))}
			</Dropdown.Menu>
		</Dropdown>
	);
}
