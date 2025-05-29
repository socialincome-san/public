import { ShowMoreToggle } from '@/components/storyblok/ShowMore';
import { formatStoryblokDate } from '@/components/storyblok/StoryblokUtils';
import { ThumbnailImage } from '@/components/storyblok/ThumbnailImage';
import { ReferenceArticle, ReferencesGroup, StoryblokImage } from '@socialincome/shared/src/storyblok/journal';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { linkCn, Separator, Typography } from '@socialincome/ui';
import Link from 'next/link';

const defaultThumbnail = { filename: '/assets/metadata/placeholder/news-outlet.svg', alt: 'news-outlet' };

function getThumbnailOrDefault(referenceArticle: ReferenceArticle): StoryblokImage {
	return referenceArticle.thumbnail?.filename
		? referenceArticle.thumbnail
		: {
				id: referenceArticle.id,
				...defaultThumbnail,
			};
}

export function StoryblokReferencesGroup(props: ReferencesGroup & { translator: Translator; lang: LanguageCode }) {
	const translator = props.translator;
	const lang = props.lang;
	const referencesGroup = props;
	const hasContextInfo = !!referencesGroup.context;
	const showThumbnails = referencesGroup.references.some((it) => !!it.thumbnail?.filename);

	function showSeparator(index: number) {
		return index > 0 || hasContextInfo;
	}

	return (
		<div className="bg-primary w-full rounded-md bg-opacity-10 p-6">
			{hasContextInfo && (
				<Typography color="foreground" className="m-0 mb-2 p-0">
					{translator.t('reference-article.context.' + referencesGroup.context)}
				</Typography>
			)}
			<ShowMoreToggle
				showLessLabel={translator.t('reference-article.show-less')}
				showMoreLabel={translator.t('reference-article.show-more')}
			>
				{referencesGroup.references.map((reference, index) => (
					<div key={reference._uid}>
						{showSeparator(index) && <Separator className="bg-foreground m-0 mb-4 mt-4 opacity-15" />}
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
									{showThumbnails && <div>{reference.mediaOutlet}</div>}
									<div>
										{translator.t('reference-article.written-by', {
											context: {
												author: reference.author,
												mediaOutlet: !showThumbnails ? reference.mediaOutlet : '',
												publicationDate: formatStoryblokDate(reference.publicationDate, lang),
											},
										})}
									</div>
								</Typography>
							</div>
						</div>
					</div>
				))}
			</ShowMoreToggle>
		</div>
	);
}
