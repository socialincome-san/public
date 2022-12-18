import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { appConfig } from '../config';
import LanguageSwitcher from './LanguageSwitcher';
import styles from './layout.module.css';

const siteName = 'SocialIncome';

interface Props {
	children: React.ReactNode;
	title: string;
}

export default function Layout({ children, title }: Props) {
	const router = useRouter();

	return (
		<div className={styles.container}>
			<Head>
				<title>{title}</title>
				<link rel="icon" href="/favicon.ico" />
				{router.locales!.map((locale) => {
					return (
						<link
							key={locale}
							rel="alternate"
							hrefLang={locale}
							href={`${appConfig.domain}/${locale}${router.asPath}`}
						/>
					);
				})}
			</Head>
			<header className={styles.header}>
				<h1>
					<Link href="/">{siteName}</Link>
				</h1>
				<LanguageSwitcher />
			</header>
			<main>
				<section>
					<h2>{title}</h2>
				</section>
				{children}
			</main>
		</div>
	);
}
