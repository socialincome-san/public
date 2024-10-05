import { DefaultPageProps } from '@/app/[lang]/[region]';
import { HeroSection } from './(sections)/hero-section';
import { Resources } from './(sections)/resources';
import { SelectionProcess } from './(sections)/selection-process';
import { PastRounds } from './(sections)/past-rounds';
import { SelectionFaq } from './(sections)/faq';

export default async function Page({ params: { lang, region } }: DefaultPageProps) {
	return (
		<div className="-mt-24 md:-mt-36">
			<HeroSection lang={lang} region={region} />
			<Resources lang={lang} region={region} />
			<SelectionProcess lang={lang} region={region} />
			<PastRounds lang={lang} region={region} />
			<SelectionFaq lang={lang} region={region} />
		</div>
	);
}