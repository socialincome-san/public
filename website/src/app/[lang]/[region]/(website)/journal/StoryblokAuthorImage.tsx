import type { StoryblokAuthor } from '@socialincome/shared/src/storyblok/journal';
import Image from 'next/image';

const sizeClasses = {
	small: 'h-8 w-8',
	medium: 'h-12 w-12',
	large: 'h-16 w-16',
	'extra-large': 'h-24 w-24',
};

type Size = 'small' | 'medium' | 'large' | 'extra-large';

function StoryblokAuthorImage(props: { author: StoryblokAuthor; size?: Size; className?: string }) {
	const { author, size = 'medium', className = '' } = props;

	return (
		<Image
			src={author.avatar.filename}
			alt={author.fullName + '-avatar'}
			className={`${sizeClasses[size]} flex-none rounded-full object-cover object-top ${className}`}
			width={300}
			height={300}
		/>
	);
}

export default StoryblokAuthorImage;
