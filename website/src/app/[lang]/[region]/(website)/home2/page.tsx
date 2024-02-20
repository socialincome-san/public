import { DefaultPageProps } from '@/app/[lang]/[region]';
import { HeroVideo } from '@/app/[lang]/[region]/(website)/home2/(sections)/hero-video';
import { Introduction } from '@/app/[lang]/[region]/(website)/home2/(sections)/introduction';
import { ExplainerVideo } from '@/app/[lang]/[region]/(website)/home2/(sections)/explainer-video';
import { MobileIllustration } from '@/app/[lang]/[region]/(website)/home2/(sections)/mobile-illustration';
import { Faq } from '@/app/[lang]/[region]/(website)/home2/(sections)/faq';
import { Approach } from '@/app/[lang]/[region]/(website)/home2/(sections)/approach';
import { RecipientSelection } from '@/app/[lang]/[region]/(website)/home2/(sections)/recipient-selection';
import { Testimonials } from '@/app/[lang]/[region]/(website)/home2/(sections)/testimonials';
import { Sdgs } from '@/app/[lang]/[region]/(website)/home2/(sections)/sdgs';
import { Translator } from '@socialincome/shared/src/utils/i18n';

export default async function Page({ params: { lang, region } }: DefaultPageProps) {
  const translator = await Translator.getInstance({
    language: lang,
    namespaces: ['website-home2', 'website-videos'] });
  return (
    <>
      <HeroVideo lang={lang} />
      <Introduction lang={lang} />
      <ExplainerVideo lang={lang} />
      <MobileIllustration lang={lang} />
      <Faq lang={lang} />
      <Approach lang={lang} />
      <RecipientSelection lang={lang} />
      <Testimonials lang={lang} />
      <Sdgs lang={lang} />
    </>
  );
}
