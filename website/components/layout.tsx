import Head from 'next/head';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import styles from './layout.module.css';

const siteName = 'SocialIncome';

interface Props {
	children: React.ReactNode;
	title: string;
}

export default function Layout({ children, title }: Props) {
	return (
		<div className={styles.container}>
			<Head>
				<title>{title}</title>
				<link rel="icon" href="/favicon.ico" />
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
