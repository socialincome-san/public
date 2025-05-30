import { formatStoryblokUrl } from '@/components/storyblok/StoryblokUtils';
import { StoryblokAuthor } from '@socialincome/shared/src/storyblok/journal';
import { ISbStoryData } from '@storyblok/react';
import Image from 'next/image';

const sizeClasses = {
	small: 'h-8 w-8',
	medium: 'h-12 w-12',
	large: 'h-14 w-14',
	'extra-large': 'h-24 w-24',
};

type Size = 'small' | 'medium' | 'large' | 'extra-large';

const AUTHOR_IMAGE_TARGET_HEIGHT = 300;
const AUTHOR_IMAGE_TARGET_WIDTH = 300;

function StoryblokAuthorImage(props: {
	author: ISbStoryData<StoryblokAuthor>;
	size?: Size;
	className?: string;
	lang: string;
	region: string;
}) {
	const { author, size = 'medium', className = '' } = props;
	return (
		<Image
			src={formatStoryblokUrl(
				author.content.avatar.filename,
				AUTHOR_IMAGE_TARGET_WIDTH,
				AUTHOR_IMAGE_TARGET_HEIGHT,
				author.content.avatar.focus,
			)}
			alt={author.content.fullName + '-avatar'}
			className={`${sizeClasses[size]} flex-none rounded-full object-cover object-top ${className}`}
			width={AUTHOR_IMAGE_TARGET_WIDTH}
			height={AUTHOR_IMAGE_TARGET_HEIGHT}
		/>
	);
}

export default StoryblokAuthorImage;
