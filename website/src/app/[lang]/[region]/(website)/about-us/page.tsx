import { DefaultPageProps } from '@/app/[lang]/[region]';
import { HundredPercentModel } from '@/app/[lang]/[region]/(website)/about-us/(sections)/100-percent-model';
import { Contact } from '@/app/[lang]/[region]/(website)/about-us/(sections)/contact';
import { FlowOfFunds } from '@/app/[lang]/[region]/(website)/about-us/(sections)/flow-of-funds';
import { OurMission } from '@/app/[lang]/[region]/(website)/about-us/(sections)/our-mission';
import Team from '@/app/[lang]/[region]/(website)/about-us/(sections)/team';
import LandingPage from './(sections)/landing-page';

export default async function Page({ params: { lang } }: DefaultPageProps) {
	return (
		<>
			<LandingPage lang={lang} />
			<OurMission lang={lang} />
			<HundredPercentModel lang={lang} />
			<FlowOfFunds lang={lang} />
			<Team lang={lang} />
			<Contact lang={lang} />
		</>
	);
}
