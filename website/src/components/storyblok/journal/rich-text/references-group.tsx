import { ShowMoreToggle } from '@/components/show-more-toggle';
import { StoryblokAssetThumbnail } from '@/components/storyblok/storyblok-asset-thumbnail';
import type { ReferenceArticle, ReferencesGroup } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokAsset } from '@/generated/storyblok/types/storyblok';
import { formatStoryblokDate } from '@/lib/services/storyblok/storyblok.utils';
import type { LanguageCode } from '@/lib/types/language';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';

const defaultThumbnail = { filename: '/assets/metadata/placeholder/news-outlet.svg', alt: 'news-outlet' };

type ReferenceLabels = {
	showMore: string;
	showLess: string;
	author: (author: string) => string;
	publicationDate: (date: string) => string;
	context: (context: string) => string;
};

type Props = ReferencesGroup & {
	lang: LanguageCode;
	labels: ReferenceLabels;
};

const getThumbnail = (reference: ReferenceArticle): StoryblokAsset =>
	reference.thumbnail?.filename ? reference.thumbnail : (defaultThumbnail as StoryblokAsset);

export const ReferencesGroupBlock = ({ references, context, lang, labels }: Props) => {
	const items = references ?? [];
	const hasContext = Boolean(context);
	const showThumbnails = items.some((item) => Boolean(item.thumbnail?.filename));

	return (
		<div className="bg-muted/50 border-border my-8 w-full rounded-2xl border p-6">
			{hasContext && <p className="text-foreground mb-4 text-sm font-medium">{labels.context(context!)}</p>}
			<ShowMoreToggle showMoreLabel={labels.showMore} showLessLabel={labels.showLess}>
				{items.map((reference, index) => (
					<div key={reference._uid}>
						{(index > 0 || hasContext) && <hr className="border-border my-4 opacity-60" />}
						<div className="flex items-center gap-4">
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
								<p className="text-muted-foreground text-sm">
									{reference.author && <span>{labels.author(reference.author)}</span>}
									{reference.publicationDate && (
										<span>
											{reference.author ? ' ' : ''}
											{labels.publicationDate(formatStoryblokDate(reference.publicationDate, lang))}
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
