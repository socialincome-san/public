import { DefaultLayoutProps } from '@/app/[lang]/[country]';
import LanguageSwitcher from '@/components/language-switcher/language-switcher';
import { SILogo } from '@/components/logos/si-logo';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { Bars3BottomRightIcon } from '@heroicons/react/24/solid';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Dropdown, Menu, Navbar, Typography } from '@socialincome/ui';
import classNames from 'classnames';
import Link from 'next/link';

type NavbarProps = {
	backgroundColor?: string;
} & DefaultLayoutProps;

export default async function ({ params, backgroundColor }: NavbarProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-common'],
	});
	const ourWork = translator.t('navigation.our-work');
	const aboutUs = translator.t('navigation.about-us');
	const transparency = translator.t('navigation.transparency');

	return (
		<BaseContainer className={classNames(backgroundColor)}>
			<Navbar className="h-20">
				<Navbar.Start>
					<Link className="text-xl normal-case" href={`/${params.lang}/${params.country}`}>
						<SILogo className="h-4" />
					</Link>
				</Navbar.Start>

				<Navbar.Center>
					<Menu horizontal className="hidden lg:flex">
						<Menu.Item>
							<Link href={`/${params.lang}/${params.country}/our-work`}>
								<Typography size="md">{ourWork}</Typography>
							</Link>
						</Menu.Item>
						<Menu.Item>
							<Link href={`/${params.lang}/${params.country}/about-us`}>
								<Typography size="md">{aboutUs}</Typography>
							</Link>
						</Menu.Item>
						<Menu.Item>
							<Link href={`/${params.lang}/${params.country}/transparency/usd`}>
								<Typography size="md">{transparency}</Typography>
							</Link>
						</Menu.Item>
					</Menu>
				</Navbar.Center>

				<Navbar.End>
					<LanguageSwitcher params={params} />
					<Link href="/me">
						<UserCircleIcon className="h-5 w-5 cursor-pointer" />
					</Link>

					<Dropdown hover end className="lg:hidden">
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
				</Navbar.End>
			</Navbar>
		</BaseContainer>
	);
}
