import { DefaultParams } from '@/app/[lang]/[country]';
import LanguageSwitcher from '@/components/language-switcher/language-switcher';
import { SILogo } from '@/components/logos/si-logo';
import { Bars3BottomRightIcon } from '@heroicons/react/24/outline';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Dropdown } from '@socialincome/ui';
import Link from 'next/link';

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
					{/*<Collapse>*/}
					{/*	<Collapse.Title>Hello</Collapse.Title>*/}
					{/*</Collapse>*/}
					{/*	<Collapse.Title>{ourWork}</Collapse.Title>*/}
					{/*	<Collapse.Details>*/}
					{/*		<Link href={`/${params.lang}/${params.country}/our-work`}>{ourWork}</Link>*/}
					{/*	</Collapse.Details>*/}
					{/*</Collapse>*/}
					{/*<Collapse>*/}
					{/*	<Collapse.Title>{aboutUs}</Collapse.Title>*/}
					{/*	<Collapse.Details>*/}
					{/*		<Link href={`/${params.lang}/${params.country}/about-us`}>{aboutUs}</Link>*/}
					{/*	</Collapse.Details>*/}
					{/*</Collapse>*/}
					{/*<Link href={`/${params.lang}/${params.country}/transparency/usd`}>Transparency</Link>*/}
				</div>

				<div className="navbar-end">
					<LanguageSwitcher params={params} />
					<Dropdown end className="bg-blue-50 lg:hidden">
						<Dropdown.Toggle color="ghost">
							<Bars3BottomRightIcon className="h-5 w-5" />
						</Dropdown.Toggle>
						<Dropdown.Menu className="w-52">
							<Dropdown.Item>
								Our work
								{/*<Link href={`/${params.lang}/${params.country}/our-work`}>{howItWorks}</Link>*/}
							</Dropdown.Item>
							<Dropdown.Item>
								About us
								{/*<Link href={`/${params.lang}/${params.country}/about-us`}>{aboutUs}</Link>*/}
							</Dropdown.Item>
							<Dropdown.Item>
								Transparency
								{/*<Link href={`/${params.lang}/${params.country}/transparency/usd`}>Transparency</Link>*/}
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				</div>
			</div>
		</BaseContainer>
	);
}
