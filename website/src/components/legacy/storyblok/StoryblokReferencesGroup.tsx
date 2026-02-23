import { ShowMoreToggle } from '@/components/legacy/storyblok/ShowMore';
import { ThumbnailImage } from '@/components/legacy/storyblok/ThumbnailImage';
import type { ReferenceArticle, ReferencesGroup } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokAsset } from '@/generated/storyblok/types/storyblok';
import { Translator } from '@/lib/i18n/translator';
import { formatStoryblokDate } from '@/lib/services/storyblok/storyblok.utils';
import { LanguageCode } from '@/lib/types/language';
import { linkCn, Separator, Typography } from '@socialincome/ui';
import Link from 'next/link';

const defaultThumbnail = { filename: '/assets/metadata/placeholder/news-outlet.svg', alt: 'news-outlet' };

const getThumbnailOrDefault = (referenceArticle: ReferenceArticle): StoryblokAsset => {
	return referenceArticle.thumbnail?.filename ? referenceArticle.thumbnail : (defaultThumbnail as StoryblokAsset);
};

export const StoryblokReferencesGroup = (props: ReferencesGroup & { translator: Translator; lang: LanguageCode }) => {
	const translator = props.translator;
	const lang = props.lang;
	const references = props.references ?? [];
	const hasContextInfo = !!props.context;
	const showThumbnails = references.some((it) => !!it.thumbnail?.filename);

	const showSeparator = (index: number) => {
		return index > 0 || hasContextInfo;
	};

	return (
		<div className="bg-primary bg-opacity-10 mt-2 w-full rounded-md p-6">
			{hasContextInfo && (
				<Typography color="foreground" className="m-0 mb-2 p-0">
					{translator.t('reference-article.context.' + props.context)}
				</Typography>
			)}
			<ShowMoreToggle
				showLessLabel={translator.t('reference-article.show-less')}
				showMoreLabel={translator.t('reference-article.show-more')}
			>
				{references.map((reference, index) => (
					<div key={reference._uid}>
						{showSeparator(index) && <Separator className="bg-foreground m-0 mt-4 mb-4 opacity-15" />}
						<div className="flex items-start gap-8">
							{showThumbnails && <ThumbnailImage thumbnail={getThumbnailOrDefault(reference)} />}
							<div className="flex flex-col justify-center">
								<Link
									className={linkCn({ arrow: 'external', underline: 'none' })}
									href={reference.url}
									key={'link' + reference._uid}
									target="_blank"
									rel="noopener noreferrer"
								>
									<Typography weight="semibold" className="m-0 p-0">
										{reference.title}
									</Typography>
								</Link>
								<Typography className="m-0 p-0" color="foreground" as="div">
									{reference.mediaOutlet && <div>{reference.mediaOutlet}</div>}
									<div>
										{reference.author && (
											<span>
												{translator.t('reference-article.author', {
													context: {
														author: reference.author,
													},
												})}
											</span>
										)}
										{reference.publicationDate && (
											<span>
												{' '}
												{translator.t('reference-article.publication-date', {
													context: {
														publicationDate: formatStoryblokDate(reference.publicationDate, lang),
													},
												})}
											</span>
										)}
									</div>
								</Typography>
							</div>
						</div>
					</div>
				))}
			</ShowMoreToggle>
		</div>
	);
};
