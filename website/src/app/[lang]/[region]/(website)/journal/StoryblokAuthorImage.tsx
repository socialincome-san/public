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

function StoryblokAuthorImage(props: {
	author: ISbStoryData<StoryblokAuthor>;
	size?: Size;
	className?: string;
	lang: string;
	region: string;
}) {
	const { author, size = 'medium', className = '', lang, region } = props;

	return (
		<Image
			src={author.content.avatar.filename}
			alt={author.content.fullName + '-avatar'}
			className={`${sizeClasses[size]} flex-none rounded-full object-cover object-top ${className}`}
			width={300}
			height={300}
		/>
	);
}

export default StoryblokAuthorImage;
