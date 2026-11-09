import { PersonCard } from '@/components/storyblok/shared/person-card';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import {
	getPersonsByCountryOfficeAction,
	getPrimaryRoleLabelsAction,
} from '@/modules/storyblok-content/storyblok-content.actions';
import { cn } from '@socialincome/design-system/cn';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselScrollNextButton,
} from '@socialincome/design-system/data-display/carousel/carousel';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { PageIntro } from '@socialincome/design-system/layout/page-intro/page-intro';
import { getTranslations } from 'next-intl/server';
import type { ComponentProps } from 'react';

type Props = {
	isoCode: string;
	title?: string;
	heading: string;
	description?: string;
	lang: WebsiteLanguage;
	wrapperProps?: ComponentProps<typeof BlockWrapper>;
};

export const CountryOfficeSection = async ({ isoCode, title, heading, description, lang, wrapperProps }: Props) => {
	const countryOfficeCode = isoCode.trim();
	if (!/^[a-z]{2}$/i.test(countryOfficeCode)) {
		return null;
	}

	const [personsResult, roleLabelsResult] = await Promise.all([
		getPersonsByCountryOfficeAction({ language: lang, values: [countryOfficeCode] }),
		getPrimaryRoleLabelsAction(lang),
	]);
	const persons = personsResult.success ? personsResult.data : [];
	const roleLabels = roleLabelsResult.success ? roleLabelsResult.data : {};
	if (persons.length === 0) {
		return null;
	}

	const isSinglePerson = persons.length === 1;
	const isSmallTeam = persons.length <= 2;
	const t = isSinglePerson ? null : await getTranslations({ locale: lang, namespace: 'website-common' });
	const carousel = (
		<Carousel opts={{ align: 'start' }} gap="lg">
			<CarouselContent>
				{persons.map((person) => (
					<CarouselItem key={person.uuid} size="card">
						<PersonCard person={person} roleLabels={roleLabels} />
					</CarouselItem>
				))}
			</CarouselContent>
			{t ? <CarouselScrollNextButton aria-label={t('countries-page.person-carousel-next-button-aria')} /> : null}
		</Carousel>
	);

	return (
		<BlockWrapper {...wrapperProps}>
			<section
				className={cn(
					'grid gap-8 lg:grid-cols-3 lg:items-center lg:gap-6',
					isSmallTeam && 'lg:mx-auto lg:max-w-5xl',
					isSinglePerson && 'lg:grid-cols-2',
				)}
			>
				<div className="pr-8 lg:pr-0">
					<PageIntro variant="section" eyebrow={title} title={heading} description={description} />
				</div>
				<div className={cn('relative min-w-0', !isSinglePerson && 'lg:col-span-2')}>
					{isSmallTeam ? (
						<>
							<ul
								className={cn(
									'hidden w-full gap-6 lg:mx-auto lg:grid',
									isSinglePerson ? 'lg:max-w-72' : 'lg:max-w-xl lg:grid-cols-2',
								)}
							>
								{persons.map((person) => (
									<li key={person.uuid}>
										<PersonCard person={person} roleLabels={roleLabels} />
									</li>
								))}
							</ul>
							<div className="lg:hidden">{carousel}</div>
						</>
					) : (
						carousel
					)}
				</div>
			</section>
		</BlockWrapper>
	);
};
