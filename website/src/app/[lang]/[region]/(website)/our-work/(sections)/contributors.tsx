import { DefaultParams } from '@/app/[lang]/[region]';
import { ContributorsOrgsCarousel } from '@/app/[lang]/[region]/(website)/our-work/(sections)/contributors-orgs-carousel';
import { ContributorsPeopleCarousel } from '@/app/[lang]/[region]/(website)/our-work/(sections)/contributors-people-carousel';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { BaseContainer, Typography } from '@socialincome/ui';
import carlosImg from '../(assets)/carlos.jpg';
import claudiaImage from '../(assets)/claudia.jpg';
import rubenImage from '../(assets)/ruben.jpg';
import vanjaImg from '../(assets)/vanja.jpg';

export async function Contributors({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['countries', 'website-our-work'],
	});

	return (
		<BaseContainer id="contributors" className="flex scroll-mt-36 flex-col justify-center space-y-24 lg:space-y-36">
			<div className="space-y-4">
				<Typography as="h3" size="xl" color="muted-foreground">
					{translator.t('contributors.header-1')}
				</Typography>
				<Typography as="h1" size="4xl" weight="bold">
					{translator.t('contributors.title-1')}
				</Typography>
				<Typography as="h2" size="2xl">
					{translator.t('contributors.text-1')}
				</Typography>
				<ContributorsOrgsCarousel />
			</div>

			<div className="space-y-4">
				<Typography as="h3" size="xl" color="muted-foreground">
					{translator.t('contributors.header-2')}
				</Typography>
				<Typography as="h1" size="4xl" weight="bold">
					{translator.t('contributors.title-2')}
				</Typography>
				<Typography as="h2" size="2xl">
					{translator.t('contributors.text-2')}
				</Typography>
				<div className="pt-10">
					<ContributorsPeopleCarousel
						portraits={[
							{
								name: 'Carlos',
								image: carlosImg,
								text: translator.t('contributors.portraits.carlos'),
								country: translator.t('US'),
							},
							{
								name: 'Vanja',
								image: vanjaImg,
								text: translator.t('contributors.portraits.vanja'),
								country: translator.t('CH'),
							},
							{
								name: 'Ruben',
								image: rubenImage,
								text: translator.t('contributors.portraits.ruben'),
								country: translator.t('CH'),
							},
							{
								name: 'Claudia',
								image: claudiaImage,
								text: translator.t('contributors.portraits.claudia'),
								country: translator.t('CH'),
							},
						]}
					/>
				</div>
			</div>
		</BaseContainer>
	);
}
