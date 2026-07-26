import { PersonCard, type VolunteerDurationTranslations } from '@/components/storyblok/shared/person-card';
import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { createWebsitePersonLink } from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import type { ISbStoryData } from '@storyblok/js';

type CardSize = 'large' | 'medium' | 'small';
export type CardLink = 'none' | 'personPage' | 'dialog';

type Props = {
	persons: ISbStoryData<Person>[];
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	centerLastRow?: boolean;
	cardSize?: CardSize;
	cardLink?: CardLink;
	// Presence enables the "volunteering since" pill on the cards.
	volunteerDurationTranslations?: VolunteerDurationTranslations;
	roleLabels?: Record<string, string>;
};

type CardSizeConfig = {
	personCardSize: 'default' | 'small' | 'compact';
	gridCols: string;
	flexItemWidth: string;
};

const CARD_SIZE_CONFIG: Record<CardSize, CardSizeConfig> = {
	large: {
		personCardSize: 'default',
		gridCols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
		flexItemWidth: 'w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1.125rem)]',
	},
	medium: {
		personCardSize: 'small',
		gridCols: 'grid-cols-2 lg:grid-cols-4 xl:grid-cols-5',
		flexItemWidth: 'w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)] xl:w-[calc(20%-1.2rem)]',
	},
	small: {
		personCardSize: 'compact',
		gridCols: 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8',
		flexItemWidth:
			'w-[calc(50%-0.75rem)] sm:w-[calc(25%-1.125rem)] lg:w-[calc(16.6667%-1.25rem)] xl:w-[calc(12.5%-1.3125rem)]',
	},
};

export const PersonCardGrid = ({
	persons,
	lang,
	region,
	centerLastRow = false,
	cardSize = 'large',
	cardLink = 'personPage',
	volunteerDurationTranslations,
	roleLabels,
}: Props) => {
	const { personCardSize, gridCols, flexItemWidth } = CARD_SIZE_CONFIG[cardSize];
	// 'dialog' isn't implemented yet — falls back to no link until that's built.
	const getHref = (person: ISbStoryData<Person>) =>
		cardLink === 'personPage' ? createWebsitePersonLink(person.slug, lang, region) : undefined;
	const volunteerDuration = volunteerDurationTranslations
		? { lang, translations: volunteerDurationTranslations }
		: undefined;

	return (
		<ul className={centerLastRow ? 'flex flex-wrap justify-center gap-6' : cn('grid gap-6', gridCols)}>
			{persons.map((person) => (
				<li key={person.uuid} className={centerLastRow ? flexItemWidth : undefined}>
					<PersonCard
						person={person}
						href={getHref(person)}
						size={personCardSize}
						className={cn('max-w-none', centerLastRow && 'w-full')}
						volunteerDuration={volunteerDuration}
						roleLabels={roleLabels}
					/>
				</li>
			))}
		</ul>
	);
};
