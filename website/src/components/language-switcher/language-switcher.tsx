import { DefaultParams } from '@/app/[lang]/[country]';
import { ValidLanguage, languages as validLanguages } from '@/i18n';
import { LocaleLanguage } from '@socialincome/shared/src/types';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import LanguageSwitcherDropdown from './language-switcher-dropdown';

interface LanguageSwitcherProps {
	params: DefaultParams;
	languages?: ValidLanguage[];
}

export default async function LanguageSwitcher({ params, languages = validLanguages }: LanguageSwitcherProps) {
	const translator = await Translator.getInstance({
		language: params.lang as LocaleLanguage,
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
