import { DefaultParams } from '@/app/[lang]/[country]';
import LanguageSwitcher from '@/components/language-switcher/language-switcher';
import { SILogo } from '@/components/logos/si-logo';
import { Bars3BottomRightIcon } from '@heroicons/react/24/solid';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, CollapsibleMenu, Dropdown } from '@socialincome/ui';
import Link from 'next/link';
import { Suspense } from 'react';

interface NavbarProps {
	params: DefaultParams;
}

export default async function Navbar({ params }: NavbarProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-common'],
	});

	const ourWork = translator.t('navigation.our-work');
	const howItWorks = translator.t('navigation.how-it-works');
	const aboutUs = translator.t('navigation.about-us');

	return (
		<BaseContainer className="bg-blue-50">
			<div className="navbar h-20">
				<div className="navbar-start">
					<Link className="text-xl normal-case" href={`/${params.lang}/${params.country}`}>
						<SILogo className="h-4" />
					</Link>
				</div>

				<div className="navbar-center hidden lg:flex">
					<CollapsibleMenu>
						<CollapsibleMenu.Label>{ourWork}</CollapsibleMenu.Label>
						<CollapsibleMenu.Item>
							<Link href={`/${params.lang}/${params.country}/our-work`}>{ourWork}</Link>
						</CollapsibleMenu.Item>
					</CollapsibleMenu>
					<CollapsibleMenu>
						<CollapsibleMenu.Label>{aboutUs}</CollapsibleMenu.Label>
						<CollapsibleMenu.Item>
							<Link href={`/${params.lang}/${params.country}/about-us`}>{aboutUs}</Link>
						</CollapsibleMenu.Item>
					</CollapsibleMenu>
					<Link href={`/${params.lang}/${params.country}/transparency/usd`}>Transparency</Link>
				</div>

				<div className="navbar-end">
					<Suspense>
						<LanguageSwitcher params={params} />
					</Suspense>
					<Dropdown alignEnd={true} className="bg-blue-50 lg:hidden">
						<Dropdown.Label>
							<div className="btn btn-ghost">
								<Bars3BottomRightIcon className="h-5 w-5" />
							</div>
						</Dropdown.Label>
						<Dropdown.Item>
							<Link href={`/${params.lang}/${params.country}/our-work`}>{howItWorks}</Link>
						</Dropdown.Item>
						<Dropdown.Item>
							<Link href={`/${params.lang}/${params.country}/about-us`}>{aboutUs}</Link>
						</Dropdown.Item>
						<Dropdown.Item>
							<Link href={`/${params.lang}/${params.country}/transparency/usd`}>Transparency</Link>
						</Dropdown.Item>
					</Dropdown>
				</div>
			</div>
		</BaseContainer>
	);
}
