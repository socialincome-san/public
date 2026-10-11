import NextImage from 'next/image';
import NextLink from 'next/link';
import { cn } from '../../../cn';
import { Badge } from '../badge/badge';

type PersonCardImage = {
	src: string;
	alt: string;
};

type PersonCardDuration = {
	label: string;
	since: string;
};

type PersonCardProps = {
	firstName: string;
	lastName?: string;
	roleLabel?: string;
	image?: PersonCardImage | null;
	href?: string;
	size?: 'default' | 'small' | 'compact';
	// Hidden on compact cards, like the role
	duration?: PersonCardDuration | null;
};

export const PersonCard = ({ firstName, lastName, roleLabel, image, href, size = 'default', duration }: PersonCardProps) => {
	const isCompact = size === 'compact';
	const isSmall = size === 'small' || isCompact;
	const showRole = Boolean(roleLabel) && !isCompact;

	const card = (
		<div
			className={cn(
				'bg-card shadow-card flex h-full w-full flex-col overflow-hidden rounded-xl',
				isSmall ? 'p-2.5' : 'p-3',
				href && 'transition-transform hover:scale-[1.01]',
			)}
		>
			<div
				className={cn(
					'bg-muted relative w-full overflow-hidden rounded-lg',
					isSmall ? 'aspect-[240/300]' : 'aspect-[280/350]',
				)}
			>
				{duration && !isCompact ? (
					<div className="group/duration absolute top-3 left-3 z-20">
						<Badge
							variant="frosted"
							// The hover-only date is exposed via title; an aria-label would replace the duration as the accessible name
							title={duration.since}
						>
							<span className="group-hover/duration:hidden">{duration.label}</span>
							<span className="hidden group-hover/duration:inline">{duration.since}</span>
						</Badge>
					</div>
				) : null}
				{image ? (
					<NextImage
						src={image.src}
						alt={image.alt}
						fill
						sizes={
							isSmall
								? '(min-width: 1280px) 240px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw'
								: '(min-width: 1280px) 281px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw'
						}
						className="border-background border-2 object-cover"
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
			{/* Wrapping lets the role drop onto its own left-aligned line when the name needs the full
			    width — otherwise a long last name is squeezed to a sliver and spills under the role. The card
			    stretches to its grid row and `mb-auto` parks the slack below, so wrapping never changes the
			    card's height relative to its neighbours. */}
			<div
				className={cn(
					'relative z-20 mb-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-1 rounded-b-lg px-2 pb-3',
					isSmall ? '-mt-5 pt-2.5' : '-mt-6 pt-3',
				)}
			>
				<h3
					className={cn(
						'relative line-clamp-2 min-w-0 font-bold',
						isCompact
							? 'text-base leading-5'
							: isSmall
								? 'text-lg leading-6 sm:text-xl sm:leading-7'
								: 'text-xl leading-7 sm:text-2xl sm:leading-8',
					)}
				>
					{firstName}
					{lastName ? (
						<>
							<br />
							<span className="font-normal">{lastName}</span>
						</>
					) : null}
				</h3>
				{showRole ? (
					<p className={cn('relative max-w-full shrink-0 truncate pb-1 leading-none', isSmall ? 'text-xs' : 'text-sm')}>
						{roleLabel}
					</p>
				) : null}
			</div>
		</div>
	);

	if (!href) {
		return card;
	}

	return (
		<NextLink href={href} className="block h-full w-full">
			{card}
		</NextLink>
	);
};
