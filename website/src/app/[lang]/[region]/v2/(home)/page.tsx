import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Approach } from '@/app/[lang]/[region]/v2/(home)/(sections)/approach';
import { FAQ } from '@/app/[lang]/[region]/v2/(home)/(sections)/faq';
import { Quotes } from '@/app/[lang]/[region]/v2/(home)/(sections)/quotes';
import { SDGGoals } from '@/app/[lang]/[region]/v2/(home)/(sections)/sdg-goals';
import { Testimonials } from '@/app/[lang]/[region]/v2/(home)/(sections)/testimonials';
import { ExplainerVideo } from './(sections)/explainer-video';
import { HeroVideo } from './(sections)/hero-video';
import { MobileIllustration } from './(sections)/mobile-illustration';
import { MonthlyIncome } from './(sections)/monthly-income';
import { Overview } from './(sections)/overview';

export default async function Page({ params: { lang, region } }: DefaultPageProps) {
	return (
		<>
			<HeroVideo lang={lang} region={region} />
			<Overview lang={lang} region={region} />
			<MonthlyIncome lang={lang} region={region} />
			<ExplainerVideo lang={lang} region={region} />
			<MobileIllustration lang={lang} region={region} />
			<FAQ lang={lang} region={region} />
			<Approach lang={lang} region={region} />
			<Quotes lang={lang} region={region} />
			{/*<RecipientSelection lang={lang} region={region} />*/}
			<Testimonials lang={lang} region={region} />
			<SDGGoals lang={lang} region={region} />
			{/*<Journal lang={lang} region={region} />*/}
		</>
	);
}
