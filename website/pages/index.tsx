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
		<Layout title={t('index.title')}>
			<br />Index Page Content:<br />
			<section>
				<p>{t('index.slogan-1')}</p>
				<p>{t('index.calculator-title')}</p>
				<p>{t('index.calculator-title-help')}</p>
				<p>{t('index.calculator-cta')}</p>
				<p>{t('index.calculator-privacy')}</p>
				<p>{t('index.calculator-taxes')}</p>
			</section>
			<section>
				<p>{t('index.video-title')}</p>
				<p>{t('index.video-subtitle')}</p>
				<p>{t('index.video-cta')}</p>
			</section>
			<section>
				<p>{t('index.idea-chapter')}</p>
				<p>{t('index.idea-title')}</p>
				<p>{t('index.idea-lead')}</p>
				<p>{t('index.idea-p1')}</p>
				<p>{t('index.idea-p2')}</p>
				<p>{t('index.idea-p3')}</p>
				<p>{t('index.idea-p4')}</p>
			</section>
			<section>
				<p>{t('index.approach-title')}</p>
				<p>{t('index.approach-box1-title')}</p>
				<p>{t('index.approach-box1-argument1')}</p>
				<p>{t('index.approach-box1-argument2')}</p>
				<p>{t('index.approach-box1-argument3')}</p>
				<p>{t('index.approach-box1-argument4')}</p>
				<p>{t('index.approach-box1-modal-p1')}</p>
				<p>{t('index.approach-box1-modal-p2')}</p>
				<p>{t('index.approach-box2-title')}</p>
				<p>{t('index.approach-box2-argument1')}</p>
				<p>{t('index.approach-box2-argument2')}</p>
				<p>{t('index.approach-box2-argument3')}</p>
				<p>{t('index.approach-box2-argument4')}</p>
				<p>{t('index.approach-box2-modal-p1')}</p>
				<p>{t('index.approach-box2-modal-p2')}</p>
				<p>{t('index.approach-box3-title')}</p>
				<p>{t('index.approach-box3-argument1')}</p>
				<p>{t('index.approach-box3-argument2')}</p>
				<p>{t('index.approach-box3-argument3')}</p>
				<p>{t('index.approach-box3-argument4')}</p>
				<p>{t('index.approach-box3-modal-p1')}</p>
				<p>{t('index.approach-box3-modal-p2')}</p>
				<p>{t('index.approach-box-articles')}</p>
				<p>{t('index.approach-box-faq')}</p>
				<p>{t('index.approach-box-close')}</p>
				<p>{t('index.approach-box-evidence')}</p>
				<p>{t('index.approach-box-takeaction')}</p>
			</section>
			<section>
				<p>{t('index.recognition-title')}</p>
				<p>{t('index.recognition-lead')}</p>
			</section>
			<section>
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
				<Link href="/login">{t('website-common.login', { ns: 'website-common' })}</Link>
				<br />
				<Link href="/account">{t('website-common.account', { ns: 'website-common' })}</Link>
				<br />
				<Link href="/books">{t('website-common.books', { ns: 'website-common' })}</Link>
				<br />
				<Link href="/social-responsibility">{t('website-common.social-responsibility', { ns: 'website-common' })}</Link>
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
