import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Approach } from '@/app/[lang]/[region]/(website)/v2/home/(sections)/approach';
import { ExplainerVideo } from '@/app/[lang]/[region]/(website)/v2/home/(sections)/explainer-video';
import { Faq } from '@/app/[lang]/[region]/(website)/v2/home/(sections)/faq';
import { HeroVideo } from '@/app/[lang]/[region]/(website)/v2/home/(sections)/hero-video';
import { Introduction } from '@/app/[lang]/[region]/(website)/v2/home/(sections)/introduction';
import { MobileIllustration } from '@/app/[lang]/[region]/(website)/v2/home/(sections)/mobile-illustration';
import { RecipientSelection } from '@/app/[lang]/[region]/(website)/v2/home/(sections)/recipient-selection';
import { Sdgs } from '@/app/[lang]/[region]/(website)/v2/home/(sections)/sdgs';
import { Testimonials } from '@/app/[lang]/[region]/(website)/v2/home/(sections)/testimonials';
import { Translator } from '@socialincome/shared/src/utils/i18n';

export default async function Page({ params: { lang, region } }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home', 'website-videos'],
	});
	return (
		<>
			<HeroVideo lang={lang} region={region}/>
			<Introduction lang={lang} region={region} />
			<ExplainerVideo lang={lang}  region={region}/>
			<MobileIllustration lang={lang} region={region} />
			<Faq lang={lang} region={region}/>
			<Approach lang={lang} region={region}/>
			<RecipientSelection lang={lang} region={region}/>
			<Testimonials lang={lang} region={region}/>
			<Sdgs lang={lang} region={region}/>
		</>
	);
}
