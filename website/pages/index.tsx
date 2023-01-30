import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import ApplePay from '../components/ApplePay';
import Layout from '../components/Layout';

export default function Home() {
	const { t } = useTranslation('website-index');

	return (
		<Layout title={t('index.title')}>
			<section>
				<p>{t('index.welcome')}</p>
			</section>
			<section>
				<Link href="/transparency/finances">{t('index.linkToFinances')}</Link>
				<br />
				<Link href="/social-responsibility">{t('index.linkToSocialResponsibility')}</Link>
				<br />
				<Link href="/take-action">{t('common.takeAction')}</Link>
				<br />
				<Link href="/our-work">{t('common.ourWork')}</Link>
				<br />
				<Link href="/about-us">{t('common.aboutUs')}</Link>
				<br />
				<Link href="/newsletter">{t('common.newsletter')}</Link>
				<br />
				<Link href="/privacy">{t('common.privacy')}</Link>
				<br />
				<Link href="/terms-contributions">{t('common.termsContributions')}</Link>
				<br />
				<Link href="/terms-use">{t('common.termsUse')}</Link>
				<br />
				<Link href="/the-arts">{t('common.theArts')}</Link>
				<br />
				<Link href="/faq">{t('common.faq')}</Link>
				<br />
				<Link href="/downloads">{t('common.downloads')}</Link>
				<br />
				<Link href="/bank-details">{t('common.bankDetails')}</Link>
				<br />
				<br />
			</section>
			<section>
				<ApplePay />
			</section>
		</Layout>
	);
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale!, ['website-index'])),
		},
	};
};
