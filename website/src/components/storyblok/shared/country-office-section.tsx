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
	const t = isSmallTeam ? null : await getTranslations({ locale: lang, namespace: 'website-common' });

	return (
		<BlockWrapper {...wrapperProps}>
			<section
				className={cn(
					'-my-6 grid gap-8 md:-my-12 lg:-my-16 lg:grid-cols-3 lg:items-center lg:gap-6',
					isSinglePerson && 'mx-auto max-w-3xl lg:max-w-5xl',
					persons.length === 2 && 'mx-auto max-w-5xl',
				)}
			>
				<PageIntro variant="section" eyebrow={title} title={heading} description={description} />
				<div className="relative min-w-0 lg:col-span-2">
					{isSmallTeam ? (
						<ul
							className={cn(
								'mx-auto grid w-full max-w-72 gap-6',
								isSinglePerson
									? 'lg:max-w-xl lg:translate-x-60 lg:-translate-y-24 lg:grid-cols-2'
									: 'sm:max-w-xl sm:grid-cols-2 lg:-translate-y-20 xl:translate-x-40',
							)}
						>
							{persons.map((person) => (
								<li key={person.uuid}>
									<PersonCard person={person} roleLabels={roleLabels} />
								</li>
							))}
						</ul>
					) : (
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
					)}
				</div>
			</section>
		</BlockWrapper>
	);
};
