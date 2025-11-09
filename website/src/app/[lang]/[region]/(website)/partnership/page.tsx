import { DefaultPageProps } from '@/app/[lang]/[region]';
import { BaseContainer } from '@socialincome/ui';
import { Contact } from './(sections)/contact';
import { Hero } from './(sections)/hero';
import { OrgsPartnershipCarousel } from './(sections)/orgs-partnership-carousel';
import { OrgsPartnershipTitle } from './(sections)/orgs-partnership-title';
import { PartnershipModels } from './(sections)/partnership-models';
import { UspCards } from './(sections)/usp-cards';

export default async function Page(props: DefaultPageProps) {
	const params = await props.params;
	const { lang, region } = params;

	return (
		<BaseContainer className="flex flex-col space-y-12 pt-16">
			<Hero lang={lang} region={region} />
			<UspCards lang={lang} region={region} />
			<OrgsPartnershipTitle lang={lang} region={region} />
			<OrgsPartnershipCarousel />
			<PartnershipModels lang={lang} region={region} />
			<Contact lang={lang} region={region} />
		</BaseContainer>
	);
}
