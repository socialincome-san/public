import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import ApplePay from '../components/ApplePay';
import Layout from '../components/Layout';

export default function Home() {
	const { t } = useTranslation('website-index');
	// noinspection HtmlUnknownTarget
	return (
		<Layout title={t('website-index.title')}>
			<section>
				<p>{t('website-index.welcome')}</p>
			</section>
			<section>
				Example translations from website-index
				<br />
				<Link href="/transparency/finances">{t('website-index.linkToFinances')}</Link>
				<br />
				<Link href="/social-responsibility">{t('website-index.linkToSocialResponsibility')}</Link>
				<br />
				<br />
				Example translations from website-common
				<br />
				<Link href="/take-action">{t('website-common.takeAction', { ns: 'website-common' })}</Link>
				<br />
				<Link href="/our-work">{t('website-common.ourWork', { ns: 'website-common' })}</Link>
				<br />
				<Link href="/about-us">{t('website-common.aboutUs', { ns: 'website-common' })}</Link>
				<br />
				<Link href="/newsletter">{t('website-common.newsletter', { ns: 'website-common' })}</Link>
				<br />
				<Link href="/privacy">{t('website-common.privacyPolicy', { ns: 'website-common' })}</Link>
				<br />
				<Link href="/terms-contributions">{t('website-common.termsContributions', { ns: 'website-common' })}</Link>
				<br />
				<Link href="/terms-use">{t('website-common.termsUse', { ns: 'website-common' })}</Link>
				<br />
				<Link href="/the-arts">{t('website-common.theArts', { ns: 'website-common' })}</Link>
				<br />
				<Link href="/faq">{t('website-common.faq', { ns: 'website-common' })}</Link>
				<br />
				<Link href="/downloads">{t('website-common.downloads', { ns: 'website-common' })}</Link>
				<br />
				<Link href="/bank-details">{t('website-common.bankDetails', { ns: 'website-common' })}</Link>
				<br />
				<Link href="/bank-details">{t('website-common.login', { ns: 'website-common' })}</Link>
				<br />
				<Link href="/bank-details">{t('website-common.account', { ns: 'website-common' })}</Link>
				<br />
				<Link href="/bank-details">{t('website-common.books', { ns: 'website-common' })}</Link>
				<br />
				<Link href="/bank-details">{t('website-common.social-responsibility', { ns: 'website-common' })}</Link>
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
			...(await serverSideTranslations(locale!, ['website-index', 'website-common', 'common'])),
		},
	};
};
