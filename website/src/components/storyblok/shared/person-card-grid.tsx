import { PersonCard, type VolunteerDurationTranslations } from '@/components/storyblok/shared/person-card';
import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { createWebsitePersonLink } from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import type { ISbStoryData } from '@storyblok/js';

type Props = {
	persons: ISbStoryData<Person>[];
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	// Switches the grid from the default medium cards to the denser compact ones.
	smallCards?: boolean;
	// Turns each card into a link to the person's page; cards stay unlinked otherwise.
	linkToPersonPage?: boolean;
	// Presence enables the "volunteering since" pill on the cards.
	volunteerDurationTranslations?: VolunteerDurationTranslations;
	roleLabels?: Record<string, string>;
};

type CardSizeConfig = {
	personCardSize: 'small' | 'compact';
	gridCols: string;
};

const MEDIUM_CARDS: CardSizeConfig = {
	personCardSize: 'small',
	gridCols: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
};

const SMALL_CARDS: CardSizeConfig = {
	personCardSize: 'compact',
	gridCols: 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8',
};

export const PersonCardGrid = ({
	persons,
	lang,
	region,
	smallCards = false,
	linkToPersonPage = false,
	volunteerDurationTranslations,
	roleLabels,
}: Props) => {
	const { personCardSize, gridCols } = smallCards ? SMALL_CARDS : MEDIUM_CARDS;
	const getHref = (person: ISbStoryData<Person>) =>
		linkToPersonPage ? createWebsitePersonLink(person.slug, lang, region) : undefined;
	const volunteerDuration = volunteerDurationTranslations
		? { lang, translations: volunteerDurationTranslations }
		: undefined;

	return (
		<ul className={cn('grid gap-6', gridCols)}>
			{persons.map((person) => (
				<li key={person.uuid}>
					<PersonCard
						person={person}
						href={getHref(person)}
						size={personCardSize}
						className="w-full max-w-none"
						volunteerDuration={volunteerDuration}
						roleLabels={roleLabels}
					/>
				</li>
			))}
		</ul>
	);
};
