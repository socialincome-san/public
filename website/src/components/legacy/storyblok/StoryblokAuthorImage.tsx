import type { Author } from '@/generated/storyblok/types/109655/storyblok-components';
import { formatStoryblokUrl } from '@/lib/services/storyblok/storyblok.utils';
import type { ISbStoryData } from '@storyblok/js';
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

const StoryblokAuthorImage = (props: {
	author: ISbStoryData<Author>;
	size?: Size;
	className?: string;
	lang: string;
	region: string;
}) => {
	const { author, size = 'medium', className = '' } = props;

	if (!author.content.avatar.filename) {
		return null;
	}

	return (
		<Image
			src={formatStoryblokUrl(
				author.content.avatar.filename,
				AUTHOR_IMAGE_TARGET_WIDTH,
				AUTHOR_IMAGE_TARGET_HEIGHT,
				author.content.avatar.focus,
			)}
			alt={`${author.content.firstName} ${author.content.lastName} avatar`}
			className={`${sizeClasses[size]} flex-none rounded-full object-cover object-top ${className}`}
			width={AUTHOR_IMAGE_TARGET_WIDTH}
			height={AUTHOR_IMAGE_TARGET_HEIGHT}
		/>
	);
};

export default StoryblokAuthorImage;
