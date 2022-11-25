import Head from 'next/head';
import styles from './layout.module.css';
import Link from 'next/link';

const siteName = "SocialIncome"

interface Props {
    children: React.ReactNode,
    title: string
}


export default function Layout({ children, title }: Props) {
    return (
        <div className={styles.container}>
            <Head>
                <title>title</title>
                <header className={styles.header}>
                    <h1>
                        <Link href="/">{siteName}</Link>
                    </h1>
                </header>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <section>
                    <h2>{title}</h2>
                </section>
                {children}
            </main>
        </div>
    );
}