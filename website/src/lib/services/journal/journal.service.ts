import { PrismaClient } from '@/generated/prisma/client';
import { BaseService } from '@/lib/services/core/base.service';
import { ServiceResult } from '@/lib/services/core/base.types';
import type {
	JournalArticlePageData,
	JournalOverviewPageData,
	JournalPersonPageData,
} from '@/lib/services/journal/journal.types';
import {
	buildJournalArticleBreadcrumbs,
	buildJournalOverviewBreadcrumbs,
	buildJournalOverviewPathname,
	buildJournalPersonBreadcrumbs,
	getJournalPersonPagePaths,
	JOURNAL_RELATED_ARTICLES_COUNT,
} from '@/lib/services/journal/journal.utils';
import { StoryblokService } from '@/lib/services/storyblok/storyblok.service';
import {
	createWebsiteJournalArticleLink,
	createWebsiteJournalPath,
	createWebsitePersonLink,
	getArticleTitle,
	getPersonDisplayName,
} from '@/lib/services/storyblok/storyblok.utils';

type JournalOverviewLabels = {
	journalLabel: string;
	overviewTitle: string;
	overviewDescription: string;
};

export class JournalService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly storyblok: StoryblokService,
	) {
		super(db);
	}

	async getOverviewPageData(
		lang: string,
		region: string,
		labels: JournalOverviewLabels,
		tagSlug?: string,
	): Promise<ServiceResult<JournalOverviewPageData>> {
		const journalPath = createWebsiteJournalPath(lang, region);
		const pathname = buildJournalOverviewPathname(journalPath, tagSlug);

		const [authorsResult, tagsResult] = await Promise.all([
			this.storyblok.getOverviewAuthors(lang),
			this.storyblok.getOverviewTags(lang),
		]);

		const authors = authorsResult.success ? authorsResult.data : [];
		const tags = tagsResult.success ? tagsResult.data : [];

		if (tagSlug) {
			const tagResult = await this.storyblok.getTag(tagSlug, lang);
			if (!tagResult.success) {
				return this.resultFail(tagResult.error);
			}

			const articlesResult = await this.storyblok.getArticlesByTag(tagResult.data.uuid, lang);
			const articles = articlesResult.success ? articlesResult.data : [];
			const totalInDefault = await this.storyblok.resolveArticleCountInDefaultLanguage(lang, articles.length, () =>
				this.storyblok.getArticleCountByTagForDefaultLang(tagResult.data.uuid),
			);

			return this.resultOk({
				articles,
				authors,
				tags,
				showMoreArticlesLink: totalInDefault > articles.length,
				pageTitle: tagResult.data.content.value,
				pageDescription: tagResult.data.content.description?.trim(),
				activeTagSlug: tagSlug,
				journalPath,
				pathname,
				breadcrumbs: buildJournalOverviewBreadcrumbs(labels.journalLabel, journalPath, lang, region, {
					slug: tagSlug,
					label: tagResult.data.content.value,
				}),
			});
		}

		const articlesResult = await this.storyblok.getOverviewArticles(lang);
		const articles = articlesResult.success ? articlesResult.data : [];
		const totalInDefault = await this.storyblok.resolveArticleCountInDefaultLanguage(lang, articles.length, () =>
			this.storyblok.getOverviewArticlesCountForDefaultLang(),
		);

		return this.resultOk({
			articles,
			authors,
			tags,
			showMoreArticlesLink: totalInDefault > articles.length,
			pageTitle: labels.overviewTitle,
			pageDescription: labels.overviewDescription,
			journalPath,
			pathname,
			breadcrumbs: buildJournalOverviewBreadcrumbs(labels.journalLabel, journalPath, lang, region),
		});
	}

	async getArticlePageData(
		lang: string,
		region: string,
		slug: string,
		journalLabel: string,
	): Promise<ServiceResult<JournalArticlePageData>> {
		const articleResult = await this.storyblok.getArticle(lang, slug);
		if (!articleResult.success) {
			return this.resultFail(articleResult.error);
		}

		const story = articleResult.data;
		const author = story.content.author;
		const relatedResult = await this.storyblok.getRelativeArticles(
			author.uuid,
			story.id,
			story.content.tags?.map((tag) => tag.uuid) ?? [],
			lang,
			JOURNAL_RELATED_ARTICLES_COUNT,
		);

		const journalPath = createWebsiteJournalPath(lang, region);

		return this.resultOk({
			story,
			relatedArticles: relatedResult.success ? relatedResult.data : [],
			breadcrumbs: buildJournalArticleBreadcrumbs(
				journalLabel,
				journalPath,
				getArticleTitle(story),
				createWebsiteJournalArticleLink(slug, lang, region),
			),
		});
	}

	async getPersonPageData(
		lang: string,
		region: string,
		slug: string,
		journalLabel: string,
	): Promise<ServiceResult<JournalPersonPageData>> {
		const personResult = await this.storyblok.getPerson(slug, lang);
		if (!personResult.success) {
			return this.resultFail(personResult.error);
		}

		const person = personResult.data;
		const articlesResult = await this.storyblok.getArticlesByAuthor(person.uuid, lang);
		const articles = articlesResult.success ? articlesResult.data : [];
		const totalInDefault = await this.storyblok.resolveArticleCountInDefaultLanguage(lang, articles.length, () =>
			this.storyblok.getArticleCountByAuthorForDefaultLang(person.uuid),
		);

		const { pathname, journalPath } = getJournalPersonPagePaths(slug, lang, region);
		const personName = getPersonDisplayName(person);

		return this.resultOk({
			person,
			articles,
			showMoreArticlesLink: totalInDefault > articles.length,
			pathname,
			breadcrumbs: buildJournalPersonBreadcrumbs(
				journalLabel,
				journalPath,
				personName,
				createWebsitePersonLink(slug, lang, region),
			),
		});
	}
}
