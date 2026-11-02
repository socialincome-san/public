import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import {
	createWebsiteCirclePath,
	createWebsitePersonLink,
	formatStoryblokDateMedium,
	formatStoryblokUrl,
	getPersonCircles,
	getPersonDisplayName,
	getRoleLabel,
} from '@/lib/storyblok/storyblok-utils';
import type { JournalArticleAuthor } from '@/modules/journal/journal.types';
import { AuthorCard } from '@socialincome/design-system/data-display/author-card/author-card';
import { getTranslations } from 'next-intl/server';

const PORTRAIT_WIDTH = 256;
const PORTRAIT_HEIGHT = 320;

type Props = {
	authors: JournalArticleAuthor[];
	roleLabels: Record<string, string>;
	circleLabels: Record<string, string>;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const ArticleAuthorCards = async ({ authors, roleLabels, circleLabels, lang, currency }: Props) => {
	const t = await getTranslations('website-journal');

	return (
		<div className="flex flex-col gap-6">
			{authors.map(({ person, articleCount }) => {
				const { avatar, bio, primaryRole, volunteerSince, volunteerStatus } = person.content;
				const name = getPersonDisplayName(person);
				const href = createWebsitePersonLink(person.slug, lang, currency);
				// Former volunteers keep their dates and circles in Storyblok, but they no longer describe them
				const isActive = volunteerStatus === 'active';
				const since = isActive ? formatStoryblokDateMedium(volunteerSince, lang) : '';
				const circles = isActive
					? getPersonCircles(person.content, circleLabels).filter((circle) => circle.status === 'active')
					: [];

				return (
					<AuthorCard
						key={person.uuid}
						name={name}
						href={href}
						image={
							avatar?.filename
								? {
										src: formatStoryblokUrl(avatar.filename, PORTRAIT_WIDTH, PORTRAIT_HEIGHT, avatar.focus),
										alt: avatar.alt?.trim() ? avatar.alt : name,
									}
								: null
						}
						subtitle={{
							label: t('article.author'),
							// The person page lists all their articles; a single one is the article being read
							count:
								articleCount > 1 ? { label: t('article.author-article-count', { count: articleCount }), href } : undefined,
							detail: getRoleLabel(primaryRole, roleLabels),
						}}
						description={bio?.trim()}
						facts={[
							...(since ? [{ label: t('person.volunteering-since'), value: since }] : []),
							...(circles.length > 0
								? [
										{
											label: t('article.author-circles'),
											links: circles.map((circle) => ({
												label: circle.label,
												href: createWebsiteCirclePath(circle.code, lang, currency),
											})),
										},
									]
								: []),
						]}
						actionLabel={t('article.author-cta', { name })}
					/>
				);
			})}
		</div>
	);
};
