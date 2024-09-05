import { DefaultPageProps } from '@/app/[lang]/[region]';
import { getMetadata } from '@/metadata';
import { BaseContainer } from '@socialincome/ui';
import FlowOfFunds from './(sections)/flow-of-funds';
import LandingPage from './(sections)/landing-page';
import OurMission from './(sections)/our-mission';
import OurPromise from './(sections)/our-promise';
import Team from './(sections)/team';

export async function generateMetadata({ params }: DefaultPageProps) {
	return getMetadata(params.lang, 'website-about-us');
}

export default async function Page({ params: { lang } }: DefaultPageProps) {
	return (
		<BaseContainer className="space-y-56 pt-40">
			<LandingPage lang={lang} />
			<OurMission lang={lang} />
			<OurPromise lang={lang} />
			<FlowOfFunds lang={lang} />
			<Team lang={lang} />
		</BaseContainer>
	);
}
