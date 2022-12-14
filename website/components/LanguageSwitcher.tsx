import { useRouter } from 'next/router';
import { ChangeEvent } from 'react';
import { useCookies } from 'react-cookie';
import { i18n } from '../next-i18next.config';

export default function LanguageSwitcher() {
	const [cookie, setCookie] = useCookies(['NEXT_LOCALE']);
	const router = useRouter();
	const { pathname, asPath, query, locale } = router;

	const switchLanguage = async (e: ChangeEvent<HTMLSelectElement>) => {
		e.preventDefault();
		const nextLocale = e.target.value;
		// this overrides the automatic language selection based on the browser settings
		// when someone explicitly sets the language
		if (cookie.NEXT_LOCALE !== locale) {
			setCookie('NEXT_LOCALE', locale, { path: '/' });
		}
		await router.push({ pathname, query }, asPath, { locale: nextLocale });
	};

	return (
		<select onChange={switchLanguage} defaultValue={locale}>
			{i18n.locales.map((locale) => (
				<option key={locale} value={locale}>
					{locale}
				</option>
			))}
		</select>
	);
}
