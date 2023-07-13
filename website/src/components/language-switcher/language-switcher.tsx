import { DefaultParams } from '@/app/[lang]/[country]';
import { Language } from '@socialincome/shared/src/types';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import LanguageSwitcherDropdown from './language-switcher-dropdown';

interface LanguageSwitcherProps {
	params: DefaultParams;
	languages?: Language[];
}

export default async function LanguageSwitcher({ params, languages = ['en', 'de'] }: LanguageSwitcherProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['common'],
	});

	return (
		<LanguageSwitcherDropdown
			languages={languages.map((lang) => ({
				label: translator.t(`languages.${lang}`),
				value: lang,
			}))}
		/>
	);
}
