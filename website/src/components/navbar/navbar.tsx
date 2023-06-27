import { DefaultParams } from '@/app/[lang]/[country]';
import LanguageSwitcher from '@/components/language-switcher/language-switcher';
import { languages } from '@/i18n';
import { Bars3BottomRightIcon } from '@heroicons/react/24/solid';
import { LocaleLanguage } from '@socialincome/shared/src/types';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { CollapsibleMenu, Dropdown } from '@socialincome/ui';
import _ from 'lodash';
import Link from 'next/link';

interface NavbarProps {
	params: DefaultParams;
}

export default async function Navbar({ params }: NavbarProps) {
	const translator = await Translator.getInstance({
		language: params.lang as LocaleLanguage,
		namespaces: ['website-common'],
	});

	const title = 'Social Income';
	const ourWork = translator.t('navigation.our-work');
	const howItWorks = translator.t('navigation.how-it-works');
	const aboutUs = translator.t('navigation.about-us');

	return (
		<div className="navbar bg-base-100">
			<div className="navbar-start">
				<Link className="btn btn-ghost normal-case text-xl" href={`/${params.lang}/${params.country}`}>
					{title}
				</Link>
			</div>

			<div className="navbar-center hidden lg:flex">
				<CollapsibleMenu>
					<CollapsibleMenu.Label>{ourWork}</CollapsibleMenu.Label>
					<CollapsibleMenu.Item>
						<Link href={`/${params.lang}/${params.country}/how-it-works`}>{howItWorks}</Link>
					</CollapsibleMenu.Item>
				</CollapsibleMenu>
				<CollapsibleMenu>
					<CollapsibleMenu.Label>{aboutUs}</CollapsibleMenu.Label>
					<CollapsibleMenu.Item>
						<Link href={`/${params.lang}/${params.country}/how-it-works`}>{howItWorks}</Link>
					</CollapsibleMenu.Item>
				</CollapsibleMenu>
			</div>

			<div className="navbar-end">
				<LanguageSwitcher params={params} languages={_.without(languages, 'kri')} />
				<Dropdown alignEnd={true} className="lg:hidden bg-blue-50">
					<Dropdown.Label>
						<div className="btn btn-ghost">
							<Bars3BottomRightIcon className="h-5 w-5" />
						</div>
					</Dropdown.Label>
					<Dropdown.Item>
						<Link href={`/${params.lang}/${params.country}/how-it-works`}>{howItWorks}</Link>
					</Dropdown.Item>
				</Dropdown>
			</div>
		</div>
	);
}
