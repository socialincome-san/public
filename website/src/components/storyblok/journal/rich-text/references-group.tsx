import { StoryblokAssetThumbnail } from '@/components/storyblok/storyblok-asset-thumbnail';
import type { ReferenceArticle, ReferencesGroup } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokAsset } from '@/generated/storyblok/types/storyblok';
import { formatStoryblokDate } from '@/lib/storyblok/storyblok-utils';
import type { LanguageCode } from '@/lib/types/language';
import { ShowMoreToggle } from '@socialincome/design-system/actions/show-more-toggle/show-more-toggle';
import { cn } from '@socialincome/design-system/cn';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const defaultThumbnail = { filename: '/assets/metadata/placeholder/news-outlet.svg', alt: 'news-outlet' };

type Props = ReferencesGroup & {
	lang: LanguageCode;
};

const getThumbnail = (reference: ReferenceArticle): StoryblokAsset =>
	reference.thumbnail?.filename ? reference.thumbnail : (defaultThumbnail as StoryblokAsset);

export const ReferencesGroupBlock = ({ references, context, lang }: Props) => {
	const t = useTranslations('website-journal');
	const items = references ?? [];
	const showThumbnails = items.some((item) => Boolean(item.thumbnail?.filename));

	return (
		<div className="bg-card border-border not-prose my-8 w-full rounded-2xl border p-6">
			{context ? <p className="text-foreground mb-4 text-lg">{t(`reference-article.context.${context}`)}</p> : null}
			<ShowMoreToggle showMoreLabel={t('reference-article.show-more')} showLessLabel={t('reference-article.show-less')}>
				{items.map((reference, index) => (
					<div key={reference._uid}>
						{(index > 0 || Boolean(context)) && <hr className="border-border my-4 opacity-60" />}
						<div className="flex items-center gap-3 text-lg">
							{showThumbnails && <StoryblokAssetThumbnail asset={getThumbnail(reference)} />}
							<div className="flex min-w-0 flex-col gap-1">
								<Link
									href={reference.url}
									target="_blank"
									rel="noopener noreferrer"
									className={cn('text-primary font-medium underline-offset-4 hover:underline')}
								>
									{reference.title}
								</Link>
								<p className="text-muted-foreground">
									{reference.author && (
										<span>
											{t('reference-article.author', { author: reference.author })}
											{reference.mediaOutlet && ` (${reference.mediaOutlet})`}
										</span>
									)}
									{!reference.author && reference.mediaOutlet && <span>{reference.mediaOutlet}</span>}
									{reference.publicationDate && (
										<span>
											{reference.author || reference.mediaOutlet ? ' ' : ''}
											{t('reference-article.publication-date', {
												publicationDate: formatStoryblokDate(reference.publicationDate, lang),
											})}
										</span>
									)}
								</p>
							</div>
						</div>
					</div>
				))}
			</ShowMoreToggle>
		</div>
	);
};
