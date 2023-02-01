import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import ApplePay from '../components/ApplePay';
import Layout from '../components/Layout';

export default function Home() {
	const { t } = useTranslation('website-index');

	return (
		<Layout title={t('title')}>
			<section>
				<p>{t('welcome')}</p>
			</section>
			<section>
				<Link href="/transparency/finances">{t('index.linkToFinances')}</Link>
				<br />
				<Link href="/social-responsibility">{t('index.linkToSocialResponsibility')}</Link>
				<br />
				<Link href="/take-action">{t('common.takeAction', { ns: 'common' })}</Link>
				<br />
				<Link href="/our-work">{t('common.ourWork', { ns: 'common' })}</Link>
				<br />
				<Link href="/about-us">{t('common.aboutUs', { ns: 'common' })}</Link>
				<br />
				<Link href="/newsletter">{t('common.newsletter', { ns: 'common' })}</Link>
				<br />
				<Link href="/privacy">{t('common.privacy', { ns: 'common' })}</Link>
				<br />
				<Link href="/terms-contributions">{t('common.termsContributions', { ns: 'common' })}</Link>
				<br />
				<Link href="/terms-use">{t('common.termsUse', { ns: 'common' })}</Link>
				<br />
				<Link href="/the-arts">{t('common.theArts', { ns: 'common' })}</Link>
				<br />
				<Link href="/faq">{t('common.faq', { ns: 'common' })}</Link>
				<br />
				<Link href="/downloads">{t('common.downloads', { ns: 'common' })}</Link>
				<br />
				<Link href="/bank-details">{t('common.bankDetails', { ns: 'common' })}</Link>
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
			...(await serverSideTranslations(locale!, ['website-index', 'common'])),
		},
	};
};
