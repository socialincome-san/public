import type { BreadcrumbLinkType } from '@/components/breadcrumb/breadcrumb';
import { SectionHeading } from '@/components/section-heading';
import { JournalArticleCard } from '@/components/storyblok/journal/article-card';
import { ArticleDetailBody } from '@/components/storyblok/journal/article-detail-body';
import { ArticleDetailHeader, ArticleDetailHeroImage } from '@/components/storyblok/journal/article-detail-header';
import { JournalBreadcrumb } from '@/components/storyblok/journal/journal-breadcrumb';
import type { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getArticleHeroImageSrc, hasArticleHeroLayout } from '@/lib/services/journal/journal.utils';
import { ResolvedArticle } from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import type { ISbStoryData } from '@storyblok/js';

type Props = {
	story: ISbStoryData<ResolvedArticle>;
	slug: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	relatedArticles: ISbStoryData<ResolvedArticle>[];
	translator: Translator;
	breadcrumbs: BreadcrumbLinkType[];
};

export const ArticleDetail = ({ story, slug, lang, region, relatedArticles, translator, breadcrumbs }: Props) => {
	const article = story.content;
	const hasHero = hasArticleHeroLayout(article);
	const heroImageSrc = getArticleHeroImageSrc(article);

	return (
		<article className={cn('w-full', hasHero && 'full-bleed-hero')}>
			{hasHero && heroImageSrc ? (
				<div className="flex min-h-[70vh] flex-col lg:flex-row">
					<ArticleDetailHeroImage heroImageSrc={heroImageSrc} alt={article.image?.alt ?? ''} />
					<ArticleDetailHeader story={story} hasHero={hasHero} lang={lang} region={region} />
				</div>
			) : (
				<div className="w-site-width max-w-content mx-auto space-y-8 px-4 pt-8 sm:px-0 sm:pt-10">
					<JournalBreadcrumb links={breadcrumbs} className="mb-8 pl-0" />
					<ArticleDetailHeader story={story} hasHero={false} lang={lang} region={region} />
				</div>
			)}

			<div className="w-site-width max-w-content mx-auto px-4 py-8 sm:px-0 sm:py-10">
				<div className="mx-auto max-w-2xl space-y-10">
					{hasHero && heroImageSrc && <JournalBreadcrumb links={breadcrumbs} className="mb-10 pl-0" />}
					<ArticleDetailBody story={story} slug={slug} lang={lang} region={region} translator={translator} />
				</div>
			</div>

			{article.showRelativeArticles && relatedArticles.length > 0 && (
				<section className="w-site-width max-w-content mx-auto px-4 pb-16 sm:px-0">
					<SectionHeading size={4} bold className="text-foreground">
						{translator.t('article.keep-reading')}
					</SectionHeading>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{relatedArticles.map((related) => (
							<JournalArticleCard
								key={related.uuid}
								lang={lang}
								region={region}
								article={related}
								videoLabel={translator.t('badge.video')}
							/>
						))}
					</div>
				</section>
			)}
		</article>
	);
};
