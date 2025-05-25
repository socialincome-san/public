import { ShowMoreToggle } from '@/components/storyblok/ShowMore';
import { formatStoryblokDate, getDimensionsFromStoryblokImageUrl } from '@/components/storyblok/StoryblokUtils';
import { ReferencesGroup, StoryblokImage } from '@socialincome/shared/src/storyblok/journal';
import { LanguageCode } from '@socialincome/shared/src/types/language';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { linkCn, Separator, Typography } from '@socialincome/ui';
import Image from 'next/image';
import Link from 'next/link';

const placeholderImage = '/assets/metadata/placeholder/news-outlet.svg';

const DEFAULT_HEIGHT = 15;

const DEFAULT_WIDTH = 25;

function thumbnailImage(thumbnail: StoryblokImage | undefined) {
	if (!thumbnail) {
		return null;
	}
	let dimensionsFromStoryblokImageUrl = getDimensionsFromStoryblokImageUrl(thumbnail.filename);
	return articleImageComponent(
		String(thumbnail.id),
		dimensionsFromStoryblokImageUrl.height ?? DEFAULT_HEIGHT,
		dimensionsFromStoryblokImageUrl.width ?? DEFAULT_WIDTH,
		thumbnail.filename,
	);
}

function articleImageComponent(id: string, height: number, width: number, src: any) {
	return (
		<Image className="my-auto flex h-14 w-20 p-0" src={src} alt={id + '-thumbnail'} width={width} height={height} />
	);
}

function placeHolderImage(id: string) {
	return articleImageComponent(id, 16, 24, placeholderImage);
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
							{showThumbnails &&
								(reference.thumbnail?.filename
									? thumbnailImage(reference.thumbnail)
									: placeHolderImage(reference._uid))}
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
