import { CommunityBackstageTrigger } from '@/components/community/community-backstage';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import type { CommunityPanelData } from '@/modules/community/community.types';
import { CommunityPanel } from '@socialincome/design-system/data-display/community-panel/community-panel';
import { uniqueByName } from '@socialincome/design-system/data-display/contributors-card/contributors-card';

const VOLUNTEERS_PLACEHOLDER = '{volunteers}';
const TICKER_PEOPLE_LIMIT = 3;
const PEOPLE_STACK_VISIBLE = 3;

type CommunityProps = {
	data: CommunityPanelData;
	lang: WebsiteLanguage;
};

export const Community = async ({ data, lang }: CommunityProps) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-community'] });
	const volunteers = translator.t('volunteers', { context: { count: data.volunteerCount } });
	const countries = translator.t('countries', { context: { count: data.countryCount } });
	const fill = (text: string, values: Record<string, string | number> = {}) =>
		Object.entries({ volunteers, countries, ...values }).reduce(
			(result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
			text,
		);

	const [introBefore, ...introAfter] = (data.intro ?? '').split(VOLUNTEERS_PLACEHOLDER);
	const intro = !data.intro
		? undefined
		: data.volunteersHref && introAfter.length > 0
			? {
					before: fill(introBefore),
					link: { label: volunteers, href: data.volunteersHref },
					after: fill(introAfter.join(VOLUNTEERS_PLACEHOLDER)),
				}
			: { before: fill(data.intro) };

	const tickerItems = data.tickerItems.map((item) => fill(item));
	const maintainerPeople = uniqueByName(data.maintainers.flatMap((group) => group.people));
	const reachOut = translator.t('reach-out');

	const panel = (
		<CommunityPanel
			heading={data.headline}
			headingEmphasis={data.headlineEmphasis}
			intro={intro}
			maintainers={
				data.maintainers.length > 0
					? {
							roles: data.maintainers,
							showMoreLabel: translator.t('show-all-contributors'),
							showLessLabel: translator.t('show-fewer-contributors'),
							mistake:
								data.mistakeText && data.contactEmail
									? {
											text: data.mistakeText,
											action: {
												label: reachOut,
												href: `mailto:${data.contactEmail}`,
												ariaLabel: translator.t('reach-out-about-page'),
											},
										}
									: undefined,
						}
					: undefined
			}
			worlds={
				data.worldsTitle
					? {
							title: data.worldsTitle,
							lessLabel: translator.t('show-less'),
							items: data.worlds.map((world) => ({
								...world,
								moreLabel: translator.t('more-people', {
									context: { count: Math.max(world.people.length - PEOPLE_STACK_VISIBLE, 0) },
								}),
							})),
						}
					: undefined
			}
			roles={
				data.rolesTitle
					? {
							title: data.rolesTitle,
							text: data.rolesText ? fill(data.rolesText, { roles: data.roleCount, shown: data.roles.length }) : undefined,
							items: data.roles.map(({ role, person, email }) => ({
								role,
								person,
								action: {
									label: reachOut,
									href: `mailto:${email}`,
									ariaLabel: translator.t('reach-out-about-role', { context: { name: person.name, role } }),
								},
							})),
						}
					: undefined
			}
			waysIn={data.waysInTitle ? { title: data.waysInTitle, items: data.waysIn, cta: data.cta } : undefined}
			reading={
				data.readingTitle
					? {
							title: data.readingTitle,
							items: data.articles.map((article) => ({
								title: article.title,
								meta: translator.t('article-by', { context: { name: article.author } }),
								href: article.href,
								imageSrc: article.imageSrc,
							})),
						}
					: undefined
			}
		/>
	);

	return (
		<CommunityBackstageTrigger
			items={tickerItems.length > 0 ? tickerItems : [translator.t('panel-label')]}
			label={translator.t('ticker-label')}
			people={maintainerPeople.slice(0, TICKER_PEOPLE_LIMIT)}
			panel={panel}
		/>
	);
};
