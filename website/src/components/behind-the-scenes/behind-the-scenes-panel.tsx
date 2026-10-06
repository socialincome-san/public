import { BehindTheScenesCloseButton } from '@/components/behind-the-scenes/behind-the-scenes-close-button';
import type { BehindTheScenesData, CommunityWorld } from '@/components/behind-the-scenes/behind-the-scenes-data';
import { BehindTheScenesPageCredits } from '@/components/behind-the-scenes/behind-the-scenes-page-credits';
import { BehindTheScenesRoles } from '@/components/behind-the-scenes/behind-the-scenes-roles';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import {
	createWebsiteCountryLink,
	createWebsiteJournalArticleLink,
	createWebsitePeopleLink,
	createWebsitePersonLink,
	formatStoryblokUrl,
} from '@/lib/storyblok/storyblok-utils';
import { Button } from '@socialincome/design-system/actions/button/button';
import { cn } from '@socialincome/design-system/cn';
import { Badge } from '@socialincome/design-system/data-display/badge/badge';
import { headingStyles } from '@socialincome/design-system/layout/section-heading/heading-styles';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const GITHUB_COMMUNITY_URL = 'https://github.com/socialincome-san/public';
/** The same filter the count is measured with, so the list matches the number exactly. */
const GITHUB_UNASSIGNED_ISSUES_URL =
	'https://github.com/socialincome-san/public/issues?q=is%3Aissue+is%3Aopen+no%3Aassignee';
const ROUTES = ['field', 'translation', 'writing', 'code'] as const;
const WORLD_AVATAR_SIZE = 36;
const ARTICLE_COVER_SIZE = 144;

type Props = {
	data: BehindTheScenesData;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

/**
 * Renders a translated sentence carrying one <link>…</link> span as text + anchor + text.
 *
 * The marker lives inside the string so translators keep the whole sentence as one unit — splitting
 * it into three keys would leave them reassembling a sentence they cannot see.
 */
const withInlineLink = (text: string, href: string) => {
	const match = text.match(/^([\s\S]*)<link>([\s\S]*?)<\/link>([\s\S]*)$/);

	if (!match) {
		return text;
	}

	const [, before, label, after] = match;

	return (
		<>
			{before}
			<Link href={href} className="text-foreground font-medium underline">
				{label}
			</Link>
			{after}
		</>
	);
};

/**
 * The countries a world covers, each linking to its own country page.
 *
 * Intl.ListFormat does the joining so the separators and the final conjunction follow the reader's
 * locale; only the element parts become links, leaving ", " and " and " as plain text.
 */
const PlaceList = ({
	items,
	lang,
	region,
}: {
	items: NonNullable<CommunityWorld['placeItems']>;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
}) => {
	let elementIndex = 0;

	return (
		<>
			{new Intl.ListFormat(lang, { style: 'long', type: 'conjunction' })
				.formatToParts(items.map((item) => item.name))
				.map((part, index) => {
					if (part.type !== 'element') {
						return <span key={index}>{part.value}</span>;
					}

					const item = items[elementIndex++];

					return item?.slug ? (
						<Link
							key={index}
							href={createWebsiteCountryLink(item.slug, lang, region)}
							className="hover:text-foreground underline"
						>
							{part.value}
						</Link>
					) : (
						<span key={index}>{part.value}</span>
					);
				})}
		</>
	);
};

/** Overlapping face stack for a world — small, decorative, never a ranking. */
const WorldFaces = ({ world }: { world: CommunityWorld }) => (
	<span className="flex">
		{world.people.map((person) => {
			const avatar = person.content.avatar;
			const src = avatar?.filename
				? formatStoryblokUrl(avatar.filename, WORLD_AVATAR_SIZE, WORLD_AVATAR_SIZE, avatar.focus)
				: null;

			return src ? (
				<Image
					key={person.uuid}
					src={src}
					alt=""
					width={WORLD_AVATAR_SIZE}
					height={WORLD_AVATAR_SIZE}
					className="border-card -mr-2 size-9 rounded-full border-2 object-cover"
				/>
			) : null;
		})}
	</span>
);

export const BehindTheScenesPanel = async ({ data, lang, region }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-open-source'] });
	const t = (key: string, context?: Record<string, string | number>) =>
		translator.t(`behind-the-scenes.panel.${key}`, context ? { context } : undefined);

	const { pageMaintainers, roleSpotlights, worlds, countries, roleCount, peopleTotal, furtherReading, unassignedIssues } =
		data;

	return (
		// Wider left padding than right: it is the gutter between the slid-aside page and the panel.
		<div className="flex min-h-full flex-col gap-8 py-8 pr-6 pl-12">
			<div className="sticky top-8 z-10 -mb-4 self-end">
				<BehindTheScenesCloseButton label={t('close')} />
			</div>

			<div className="flex flex-col gap-5">
				{/* Each sentence gets its own line rather than wrapping mid-phrase. */}
				<h3 className={cn(headingStyles[3], 'font-normal')} data-reveal>
					<span className="block">{t('title-lead')}</span>
					<strong className="block font-bold">{t('title-emphasis')}</strong>
				</h3>
				{/*
				 * The intro sentence ends on a colon, so the card is its continuation and sits close to it
				 * rather than a section apart.
				 */}
				<div className="flex flex-col gap-3">
					<p className="text-base" data-reveal>
						{withInlineLink(t('intro', { people: peopleTotal, countries }), createWebsitePeopleLink(lang, region))}
					</p>

					{/*
					 * Who is answerable for this page. Collapsed by default so it costs one row, but the names
					 * are visible in that row — only the roles and the mistake-report fold away.
					 */}
					{pageMaintainers.length > 0 ? (
						<div data-reveal>
							<BehindTheScenesPageCredits
								maintainers={pageMaintainers}
								labels={{
									showMore: t('page-credits.show-more'),
									showLess: t('page-credits.show-less'),
									more: (count) => t('page-credits.more', { count }),
									mistake: t('page-credits.mistake'),
									reachOut: t('contact-action'),
									reachOutAria: (name) => t('page-credits.reach-out-aria', { name }),
								}}
								personHref={(slug) => createWebsitePersonLink(slug, lang, region)}
							/>
						</div>
					) : null}
				</div>
			</div>

			{/*
			 * Three settings rather than a ranked list of people. Each world is a peer of the others, so
			 * the 34 people who work offline are a group in their own right, not a remainder.
			 */}
			<section className="flex flex-col gap-4">
				<h3 className="text-foreground text-xl font-bold" data-reveal>
					{t('where')}
				</h3>
				<div className="flex flex-col gap-5">
					{worlds.map((world) => (
						<div key={world.key} className="bg-card flex flex-col gap-3 rounded-xl p-4 shadow-lg lg:p-6" data-reveal>
							{/* The tag answers "can I do this from home?" per card, rather than leaving it to inference. */}
							<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
								<span className="text-foreground text-xl font-bold">{t(`world.${world.key}.name`)}</span>
								<Badge>{t(world.remote ? 'world.tag.remote' : 'world.tag.onsite')}</Badge>
							</div>
							<p className="text-foreground text-base">
								{world.roles
									? t(world.moreRoles ? 'world.table.roles-more' : 'world.table.roles', { roles: world.roles })
									: t(`world.${world.key}.what`)}
								{/* Omitted rather than shown as zero when GitHub is unreachable — a made-up count reads as fact. */}
								{world.key === 'code' && unassignedIssues !== null ? (
									<> {withInlineLink(t('world.code.issues', { count: unassignedIssues }), GITHUB_UNASSIGNED_ISSUES_URL)}</>
								) : null}
							</p>
							{/*
							 * The faces carry the count: whoever does not fit becomes a +N, the same way on every
							 * card. Anything else worth saying (places, trips) follows it.
							 */}
							<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
								<WorldFaces world={world} />
								<span className="text-muted-foreground text-sm">
									{world.total > world.people.length ? t('more-people', { count: world.total - world.people.length }) : null}
									{world.total > world.people.length && world.placeItems?.length ? ' · ' : null}
									{world.placeItems?.length ? <PlaceList items={world.placeItems} lang={lang} region={region} /> : null}
								</span>
							</div>
						</div>
					))}
				</div>
			</section>

			{/*
			 * Crafts rather than named page contributors: who made which page is not recorded, and the
			 * roles are. Re-sampled on every render so the same handful never owns the section.
			 */}
			{roleSpotlights.length > 0 ? (
				<section className="flex flex-col gap-4">
					<div className="flex flex-col gap-1" data-reveal>
						<h3 className="text-foreground text-xl font-bold">{t('roles')}</h3>
						{/* The whole roster, filterable by role, for anyone whose role is not in this draw. */}
						<p className="text-muted-foreground text-base">
							{t('roles-note', { shown: roleSpotlights.length, total: roleCount })}{' '}
							<Link href={createWebsitePeopleLink(lang, region)} className="text-foreground font-medium underline">
								{t('roles-all')}
							</Link>
						</p>
					</div>
					<div className="bg-card rounded-xl p-4 shadow-lg lg:p-6" data-reveal>
						<BehindTheScenesRoles
							spotlights={roleSpotlights}
							contactAction={t('contact-action')}
							contactLabel={(spotlight) =>
								t('contact-person', { name: spotlight.person.content.fullName, role: spotlight.roleLabel })
							}
							personHref={(slug) => createWebsitePersonLink(slug, lang, region)}
						/>
					</div>
				</section>
			) : null}

			{/*
			 * The catch for anyone who did not recognise themselves in the five roles above: concrete
			 * things to start with, sized so the commitment is visible before anyone commits. Heading sits
			 * on the panel like every other section; only the routes live in the card.
			 */}
			<section className="flex flex-col gap-4">
				<h3 className="text-foreground text-xl font-bold" data-reveal>
					{t('ways-in')}
				</h3>
				<div className="bg-card flex flex-col gap-4 rounded-xl p-4 shadow-lg lg:p-6" data-reveal>
					{/*
					 * Plain rows, not pills. Only the CTA below has a real destination, so anything with a
					 * button-like surface here would promise a click that does not exist.
					 */}
					<dl className="flex flex-col">
						{ROUTES.map((route) => (
							<div
								key={route}
								className="border-border/60 flex items-baseline justify-between gap-4 border-b py-2 last:border-b-0"
							>
								<dt className="text-base">{t(`route.${route}.name`)}</dt>
								<dd className="text-muted-foreground shrink-0 text-sm">{t(`route.${route}.cost`)}</dd>
							</div>
						))}
					</dl>
					<Button asChild fullWidth>
						<Link href={GITHUB_COMMUNITY_URL} target="_blank" rel="noopener noreferrer">
							{t('join-button')}
						</Link>
					</Button>
				</div>
			</section>

			{furtherReading.length > 0 ? (
				<section className="flex flex-col gap-4">
					<h3 className="text-foreground text-xl font-bold" data-reveal>
						{t('further-reading')}
					</h3>
					<div className="flex flex-col gap-5">
						{furtherReading.map((article) => {
							const cover = article.content.image?.filename;
							const author = article.content.author?.content?.fullName;

							return (
								<Link
									key={article.uuid}
									href={createWebsiteJournalArticleLink(article.slug, lang, region)}
									data-reveal
									className="border-border bg-card group flex items-center gap-3 rounded-xl border p-3 shadow-lg transition-transform hover:-translate-y-0.5 md:gap-4 md:rounded-2xl md:p-4"
								>
									{cover ? (
										<Image
											src={formatStoryblokUrl(cover, ARTICLE_COVER_SIZE, ARTICLE_COVER_SIZE, article.content.image?.focus)}
											alt=""
											width={ARTICLE_COVER_SIZE}
											height={ARTICLE_COVER_SIZE}
											className="size-12 shrink-0 rounded-md object-cover md:size-[4.5rem] md:rounded-lg"
										/>
									) : (
										<span className="bg-muted size-12 shrink-0 rounded-md md:size-[4.5rem] md:rounded-lg" />
									)}
									<span className="flex min-w-0 flex-1 flex-col">
										<span className="text-foreground text-sm leading-snug font-semibold md:text-base">
											{article.content.title}
										</span>
										{author ? (
											<span className="text-muted-foreground mt-0.5 text-xs leading-4 md:mt-1 md:text-sm md:leading-5">
												{t('by-author', { author })}
											</span>
										) : null}
									</span>
									<ChevronRight className="text-muted-foreground size-5 shrink-0" aria-hidden="true" />
								</Link>
							);
						})}
					</div>
				</section>
			) : null}
		</div>
	);
};
