import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import { formatStoryblokUrl } from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import type { ISbStoryData } from '@storyblok/js';
import NextImage from 'next/image';
import NextLink from 'next/link';

const PERSON_CARD_IMAGE_WIDTH = 400;
const PERSON_CARD_IMAGE_HEIGHT = 500;

type Props = {
	person: ISbStoryData<Person>;
	href?: string;
	size?: 'default' | 'small';
	className?: string;
};

export const PersonCard = ({ person, href, size = 'default', className }: Props) => {
	const { avatar, firstName, fullName, lastName, primaryRole } = person.content;
	const imageSource = avatar?.filename
		? formatStoryblokUrl(avatar.filename, PERSON_CARD_IMAGE_WIDTH, PERSON_CARD_IMAGE_HEIGHT, avatar.focus)
		: null;
	const role = typeof primaryRole === 'string' ? primaryRole.trim() : '';

	const isSmall = size === 'small';

	const card = (
		<div
			className={cn(
				'bg-card w-full overflow-hidden rounded-xl shadow-[0px_4px_28px_0px_rgba(0,30,101,0.07)]',
				isSmall ? 'max-w-[260px] p-2.5' : 'max-w-[305px] p-3',
				href && 'transition-transform hover:scale-[1.01]',
				className,
			)}
		>
			<div
				className={cn(
					'bg-muted relative w-full overflow-hidden rounded-lg',
					isSmall ? 'aspect-[240/300]' : 'aspect-[280/350]',
				)}
			>
				{imageSource ? (
					<NextImage
						src={imageSource}
						alt={avatar?.alt ?? fullName}
						fill
						sizes={
							isSmall
								? '(min-width: 1280px) 240px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw'
								: '(min-width: 1280px) 281px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw'
						}
						className="object-cover"
					/>
				) : null}
				<svg
					className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-8 w-full"
					viewBox="0 0 279 32"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					preserveAspectRatio="none"
				>
					<path
						d="M0 0H132.305C159.296 0 185.482 9.1858 206.558 26.0465C211.375 29.9004 217.361 32 223.53 32H279H0V0Z"
						fill="white"
					/>
				</svg>
			</div>
			<div
				className={cn(
					'relative z-20 flex items-end justify-between gap-4 rounded-b-lg px-2 pb-3',
					isSmall ? '-mt-5 pt-2.5' : '-mt-6 pt-3',
				)}
			>
				<h3 className={cn('relative font-bold', isSmall ? 'text-xl leading-7' : 'text-2xl leading-8')}>
					{firstName || fullName}
					{lastName ? (
						<>
							<br />
							<span className="font-normal">{lastName}</span>
						</>
					) : null}
				</h3>
				{role ? (
					<p className={cn('relative shrink-0 pb-1 leading-none capitalize', isSmall ? 'text-xs' : 'text-sm')}>{role}</p>
				) : null}
			</div>
		</div>
	);

	if (!href) {
		return card;
	}

	return (
		<NextLink href={href} className={cn('block w-full', isSmall ? 'max-w-[260px]' : 'max-w-[305px]', className)}>
			{card}
		</NextLink>
	);
};
