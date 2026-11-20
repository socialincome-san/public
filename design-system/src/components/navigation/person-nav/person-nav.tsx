import { ArrowLeft, ArrowRight } from 'lucide-react';
import NextLink from 'next/link';
import { cn } from '../../../cn';
import { Avatar, AvatarFallback, AvatarImage } from '../../data-display/avatar/avatar';
import { getInitials } from '../../data-display/avatar/get-initials';
import { Badge } from '../../data-display/badge/badge';

type PersonNavNeighbor = {
	// "Previous" or "Next"
	label: string;
	name: string;
	// Shown instead of the name on small screens, e.g. the first name
	shortName: string;
	href: string;
	imageSrc?: string | null;
};

type PersonNavProps = {
	// Names the navigation for screen readers
	label: string;
	previous: PersonNavNeighbor;
	next: PersonNavNeighbor;
	// The count is shown in a pill after the label
	all: { label: string; href: string; count?: number };
};

const focusRing = 'focus-visible:ring-primary-foreground rounded-full focus-visible:ring-2 focus-visible:outline-hidden';

const Neighbor = ({ neighbor, direction }: { neighbor: PersonNavNeighbor; direction: 'prev' | 'next' }) => {
	const isNext = direction === 'next';
	const Arrow = isNext ? ArrowRight : ArrowLeft;

	return (
		<NextLink
			href={neighbor.href}
			rel={direction}
			className={cn('group flex min-w-0 items-center gap-2 sm:gap-3', focusRing, isNext && 'flex-row-reverse text-right')}
		>
			{/* Small screens keep the face and drop the arrow button, so all three links fit on one line */}
			<span
				aria-hidden="true"
				className="border-primary-foreground/40 group-hover:bg-primary-foreground/10 flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors max-sm:hidden"
			>
				<Arrow className="size-4" />
			</span>
			<span aria-hidden="true" className="text-foreground shrink-0 scheme-light">
				<Avatar size="lg">
					{neighbor.imageSrc ? <AvatarImage src={neighbor.imageSrc} alt="" /> : null}
					<AvatarFallback>{getInitials(neighbor.name)}</AvatarFallback>
				</Avatar>
			</span>
			<span className="flex min-w-0 flex-col">
				<span className="text-primary-foreground/70 text-xs">{neighbor.label}</span>
				<span className="truncate text-sm font-medium sm:text-base">
					<span className="sm:hidden">{neighbor.shortName}</span>
					<span className="max-sm:hidden">{neighbor.name}</span>
				</span>
			</span>
		</NextLink>
	);
};

/** Steps through a list of people from a dark surface: the previous one, all of them, the next one. */
export const PersonNav = ({ label, previous, next, all }: PersonNavProps) => (
	<nav
		aria-label={label}
		className="text-primary-foreground grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-2 sm:gap-x-4"
	>
		<div className="flex min-w-0 justify-start">
			<Neighbor neighbor={previous} direction="prev" />
		</div>
		<div className="flex justify-center">
			<NextLink
				href={all.href}
				className={cn(
					'group inline-flex items-center gap-1.5 px-1 text-sm font-medium whitespace-nowrap sm:gap-2 sm:px-2',
					focusRing,
				)}
			>
				<span className="underline underline-offset-4 group-hover:no-underline">{all.label}</span>
				{all.count === undefined ? null : (
					<Badge variant="ghost" size="sm">
						{all.count}
					</Badge>
				)}
			</NextLink>
		</div>
		<div className="flex min-w-0 justify-end">
			<Neighbor neighbor={next} direction="next" />
		</div>
	</nav>
);
