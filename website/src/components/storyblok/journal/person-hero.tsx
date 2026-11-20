import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import { getWebsiteBasePath, type WebsiteCurrency } from '@/lib/i18n/utils';
import { WEBSITE_CIRCLE_PATH_SEGMENT } from '@/lib/storyblok/storyblok-paths';
import {
	createWebsiteCirclePath,
	createWebsitePeoplePath,
	createWebsitePersonLink,
	formatStoryblokDateMedium,
	formatStoryblokUrl,
	getOptionCode,
	getPersonAvatarSrc,
	getPersonCircles,
	getPersonDisplayName,
	getPersonFirstName,
	getPersonGitHubUrl,
	getPersonLinkedInUrl,
	getRoleLabel,
	getVolunteerDurationParts,
	getVolunteeringStat,
} from '@/lib/storyblok/storyblok-utils';
import { toCountryCode } from '@/lib/types/country';
import { HOURS_RANGE_REGEX } from '@/lib/utils/regex';
import type { JournalPersonPageData } from '@/modules/journal/journal.types';
import { PersonCircles } from '@socialincome/design-system/data-display/person-circles/person-circles';
import { PersonHero as DesignSystemPersonHero } from '@socialincome/design-system/layout/person-hero/person-hero';
import { PersonNav } from '@socialincome/design-system/navigation/person-nav/person-nav';
import type { ISbStoryData } from '@storyblok/js';
import { useTranslations } from 'next-intl';

// Twice the largest size the round portrait is shown at
const PORTRAIT_SIZE = 560;
const GET_INVOLVED_PATH = 'get-involved';

type Props = Pick<
	JournalPersonPageData,
	'person' | 'neighbors' | 'activePeopleCount' | 'roleLabels' | 'circleLabels' | 'workStyleLabels'
> & {
	lang: string;
	currency: WebsiteCurrency;
	todayMs: number;
};

export const PersonHero = ({
	person,
	neighbors,
	activePeopleCount,
	roleLabels,
	circleLabels,
	workStyleLabels,
	lang,
	currency,
	todayMs,
}: Props) => {
	const t = useTranslations('website-journal');
	const tCountries = useTranslations('countries');
	const { avatar, country, githubName, likesDeadline, linkedinName, primaryRole, volunteerSince, volunteerStatus } =
		person.content;
	const name = getPersonDisplayName(person);
	const firstName = getPersonFirstName(person);
	const lastName = person.content.firstName?.trim() ? (person.content.lastName?.trim() ?? '') : '';
	const countryCode = toCountryCode(getOptionCode(country));
	const basePath = getWebsiteBasePath(lang, currency);

	const circles = getPersonCircles(person.content, circleLabels).map((circle) => ({
		label: circle.label,
		href: createWebsiteCirclePath(circle.code, lang, currency),
		status: circle.status,
	}));
	const activeCircles = circles.filter((circle) => circle.status === 'active');
	const interestedCount = circles.length - activeCircles.length;

	// Someone who stopped volunteering keeps their start date, but no longer counts the years
	const volunteering =
		volunteerStatus === 'active' ? getVolunteeringStat(getVolunteerDurationParts(volunteerSince, lang, todayMs)) : null;
	const startDate = formatStoryblokDateMedium(volunteerSince, lang);
	const timeCommitment = getOptionCode(person.content.timeCommitment);
	const workStyle = getOptionCode(person.content.workStyle);
	// An unchecked box can also mean nobody filled it in, so "no deadlines" only shows next to a work style
	const deadlineLabel = likesDeadline
		? t('person.hero-likes-deadlines')
		: workStyle
			? t('person.hero-prefers-no-deadlines')
			: null;
	const commitmentDetails = [
		...(workStyle ? [t('person.hero-work-style', { style: workStyleLabels[workStyle] ?? workStyle })] : []),
		...(deadlineLabel ? [deadlineLabel] : []),
	];
	const stats = [
		...(volunteering
			? [
					{
						value: String(volunteering.count),
						label: t(`person.hero-${volunteering.unit}`, { count: volunteering.count }),
						description: startDate ? t('person.hero-since', { date: startDate }) : undefined,
					},
				]
			: []),
		// The datasource also holds answers that are no number of hours, e.g. "On a break"
		...(HOURS_RANGE_REGEX.test(timeCommitment)
			? [
					{
						value: timeCommitment,
						label: t('person.hero-hours'),
						description:
							commitmentDetails.length > 0 ? commitmentDetails.map((line) => <p key={line}>{line}</p>) : undefined,
					},
				]
			: []),
		...(activeCircles.length > 0
			? [
					{
						value: String(activeCircles.length),
						label: t('person.hero-circles', { count: activeCircles.length }),
						description: (
							<>
								<p>{t('person.hero-circles-active', { count: activeCircles.length })}</p>
								{interestedCount > 0 ? <p>{t('person.hero-circles-interested', { count: interestedCount })}</p> : null}
							</>
						),
					},
				]
			: []),
	];

	const toNeighbor = (neighbor: ISbStoryData<Person>, label: string) => ({
		label,
		name: getPersonDisplayName(neighbor),
		shortName: getPersonFirstName(neighbor),
		href: createWebsitePersonLink(neighbor.slug, lang, currency),
		imageSrc: getPersonAvatarSrc(neighbor),
	});

	return (
		<DesignSystemPersonHero
			firstName={firstName}
			lastName={lastName}
			role={getRoleLabel(primaryRole, roleLabels) || undefined}
			country={countryCode ? { code: countryCode, name: tCountries(countryCode) } : undefined}
			status={volunteerStatus ? { label: t(`person.status-${volunteerStatus}`), variant: volunteerStatus } : undefined}
			stats={stats}
			// Nobody can join someone who left
			action={
				volunteerStatus === 'inactive'
					? undefined
					: { label: t('person.hero-volunteer', { name: firstName }), href: `${basePath}/${GET_INVOLVED_PATH}` }
			}
			links={[
				...(linkedinName ? [{ label: 'LinkedIn', href: getPersonLinkedInUrl(linkedinName) }] : []),
				...(githubName ? [{ label: 'GitHub', href: getPersonGitHubUrl(githubName) }] : []),
			]}
			externalLinkLabel={t('person.opens-in-new-tab')}
			visual={
				<PersonCircles
					image={
						avatar?.filename
							? {
									src: formatStoryblokUrl(avatar.filename, PORTRAIT_SIZE, PORTRAIT_SIZE, avatar.focus),
									alt: avatar.alt ?? name,
								}
							: null
					}
					initials={`${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()}
					activeCircles={activeCircles}
					interestedCircles={circles.filter((circle) => circle.status === 'interested')}
					legend={{ active: t('person.legend-active'), interested: t('person.legend-interested') }}
					more={{
						href: `${basePath}/${WEBSITE_CIRCLE_PATH_SEGMENT}`,
						getLabel: (count) => t('person.circles-more', { count }),
					}}
				/>
			}
			footer={
				neighbors ? (
					<PersonNav
						label={t('person.nav-label')}
						previous={toNeighbor(neighbors.previous, t('person.nav-previous'))}
						next={toNeighbor(neighbors.next, t('person.nav-next'))}
						all={{
							label: t('person.nav-all'),
							count: activePeopleCount,
							href: createWebsitePeoplePath(lang, currency),
						}}
					/>
				) : undefined
			}
		/>
	);
};
