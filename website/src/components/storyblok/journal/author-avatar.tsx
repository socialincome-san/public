import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import { getPersonAvatarSrc, getPersonDisplayName } from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import type { ISbStoryData } from '@storyblok/js';
import Image from 'next/image';

const sizeClasses = {
	sm: 'size-8',
	md: 'size-12',
	lg: 'size-12',
	xl: 'size-24',
} as const;

type Size = keyof typeof sizeClasses;

type Props = {
	author: ISbStoryData<Person>;
	size?: Size;
	className?: string;
};

export const AuthorAvatar = ({ author, size = 'md', className }: Props) => {
	const src = getPersonAvatarSrc(author);
	if (!src) {
		return null;
	}

	return (
		<Image
			src={src}
			alt={`${getPersonDisplayName(author)} avatar`}
			className={cn(sizeClasses[size], 'shrink-0 rounded-full object-cover object-top', className)}
			width={300}
			height={300}
		/>
	);
};
