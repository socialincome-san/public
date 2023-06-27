'use client';

import { ValidLanguage } from '@/i18n';
import { LanguageIcon } from '@heroicons/react/24/solid';
import { Dropdown } from '@socialincome/ui';
import { useRouter, useSearchParams } from 'next/navigation';

interface LanguageSwitcherProps {
	languages: { label: string; value: ValidLanguage }[];
}

export default function LanguageSwitcherDropdown({ languages }: LanguageSwitcherProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const onLanguageChange = (lang: ValidLanguage) => {
		const pathSegments = window.location.pathname.split('/');
		pathSegments[1] = lang;
		const current = new URLSearchParams(Array.from(searchParams.entries()));
		router.push(pathSegments.join('/') + '?' + current.toString());
	};

	return (
		<Dropdown alignEnd>
			<Dropdown.Label>
				<div className="btn btn-ghost">
					<LanguageIcon className="h-5 w-5" />
				</div>
			</Dropdown.Label>
			{languages.map((language, index) => (
				<Dropdown.Item key={index} onClick={() => onLanguageChange(language.value)}>
					{language.label}
				</Dropdown.Item>
			))}
		</Dropdown>
	);
}
