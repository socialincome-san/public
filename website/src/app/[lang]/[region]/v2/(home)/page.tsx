import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Approach } from '@/app/[lang]/[region]/v2/(home)/(sections)/approach';
import { ExplainerVideo } from '@/app/[lang]/[region]/v2/(home)/(sections)/explainer-video';
import { Faq } from '@/app/[lang]/[region]/v2/(home)/(sections)/faq';
import { HeroVideo } from '@/app/[lang]/[region]/v2/(home)/(sections)/hero-video';
import { Journal } from '@/app/[lang]/[region]/v2/(home)/(sections)/journal';
import { MobileIllustration } from '@/app/[lang]/[region]/v2/(home)/(sections)/mobile-illustration';
import { MonthlyIncome } from '@/app/[lang]/[region]/v2/(home)/(sections)/monthly-income';
import { Overview } from '@/app/[lang]/[region]/v2/(home)/(sections)/overview';
import { Quotes } from '@/app/[lang]/[region]/v2/(home)/(sections)/quotes';
import { RecipientSelection } from '@/app/[lang]/[region]/v2/(home)/(sections)/recipient-selection';
import { Sdgoals } from '@/app/[lang]/[region]/v2/(home)/(sections)/sdgoals';
import { Testimonials } from '@/app/[lang]/[region]/v2/(home)/(sections)/testimonials';
import { Translator } from '@socialincome/shared/src/utils/i18n';

export default async function Page({ params: { lang, region } }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-(home)', 'website-videos'],
	});
	return (
		<>
			<HeroVideo lang={lang} region={region} />
			<Overview lang={lang} region={region} />
			<MonthlyIncome lang={lang} region={region} />
			<ExplainerVideo lang={lang} region={region} />
			<MobileIllustration lang={lang} region={region} />
			<Faq lang={lang} region={region} />
			<Approach lang={lang} region={region} />
			<Quotes lang={lang} region={region} />
			<RecipientSelection lang={lang} region={region} />
			<Testimonials lang={lang} region={region} />
			<Sdgoals lang={lang} region={region} />
			<Journal lang={lang} region={region} />
		</>
	);
}
