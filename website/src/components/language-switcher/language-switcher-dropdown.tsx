'use client';

import { LanguageIcon } from '@heroicons/react/24/solid';
import { Language } from '@socialincome/shared/src/types';
import { Dropdown } from '@socialincome/ui';
import { useRouter, useSearchParams } from 'next/navigation';

interface LanguageSwitcherProps {
	languages: { label: string; value: Language }[];
}

export default function LanguageSwitcherDropdown({ languages }: LanguageSwitcherProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const onLanguageChange = (lang: Language) => {
		const pathSegments = window.location.pathname.split('/');
		pathSegments[1] = lang;
		const current = new URLSearchParams(Array.from(searchParams.entries()));
		router.push(pathSegments.join('/') + '?' + current.toString());
	};

	return (
		<Dropdown end>
			<Dropdown.Toggle color="ghost">
				<LanguageIcon className="h-5 w-5" />
			</Dropdown.Toggle>
			<Dropdown.Menu>
				{languages.map((language, index) => (
					<Dropdown.Item key={index} onClick={() => onLanguageChange(language.value)}>
						{language.label}
					</Dropdown.Item>
				))}
			</Dropdown.Menu>
		</Dropdown>
	);
}
