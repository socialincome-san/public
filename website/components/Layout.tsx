import { Container } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
// @ts-ignore
import config from '../config';
import LanguageSwitcher from './LanguageSwitcher';
import Link from './Link';

const siteName = 'SocialIncome';

interface Props {
	children: React.ReactNode;
	title: string;
}

export default function Layout({ children, title }: Props) {
	const router = useRouter();

	return (
		<div>
			<Head>
				<title>{title}</title>
				<link rel="icon" href="/favicon.ico" />
				{router.locales!.map((locale) => {
					return (
						<link key={locale} rel="alternate" hrefLang={locale} href={`${config.domain}/${locale}${router.asPath}`} />
					);
				})}
			</Head>
			<header>
				<Container maxWidth="sm">
					<h1>
						<Link href="/">{siteName}</Link>
					</h1>
					<LanguageSwitcher languages={config.websiteLanguages} fallbackIsoCode={config.defaultIsoCode} />
				</Container>
			</header>
			<main>
				<Container maxWidth="sm">
					<h2>{title}</h2>
					{children}
				</Container>
			</main>
		</div>
	);
}
