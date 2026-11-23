import NextLink from 'next/link';
import { cn } from '../../../cn';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar/avatar';

type PersonPillImage = {
	src: string;
	alt: string;
};

type PersonPillProps = {
	firstName: string;
	lastName?: string;
	// Second line, already formatted
	subline?: string;
	// Stays visible when the subline is cut off, e.g. "+4"
	sublineSuffix?: string;
	// Read by screen readers instead of subline and suffix, e.g. "Technology Circle and 4 more circles"
	sublineLabel?: string;
	image?: PersonPillImage | null;
	href?: string;
};

const pillClassName = 'bg-card shadow-card inline-flex min-h-11 max-w-full items-center gap-3 rounded-full p-1.5 pr-5';

export const PersonPill = ({ firstName, lastName, subline, sublineSuffix, sublineLabel, image, href }: PersonPillProps) => {
	const initials = `${firstName.trim().charAt(0)}${lastName?.trim().charAt(0) ?? ''}`.toUpperCase();
	const content = (
		<>
			{/* The name next to it already says who this is */}
			<span aria-hidden="true">
				<Avatar size="xl">
					{image ? <AvatarImage src={image.src} alt="" /> : null}
					<AvatarFallback tone="muted">{initials}</AvatarFallback>
				</Avatar>
			</span>
			<span className="flex min-w-0 flex-col">
				<span className="text-foreground truncate text-base leading-5.5 font-medium">
					{firstName}
					{lastName ? ` ${lastName}` : null}
				</span>
				{subline ? (
					<span className="text-muted-foreground text-sm leading-4.5">
						{sublineLabel ? <span className="sr-only">{sublineLabel}</span> : null}
						<span className="flex min-w-0 gap-1" aria-hidden={sublineLabel ? true : undefined}>
							<span className="truncate">{subline}</span>
							{sublineSuffix ? <span className="shrink-0">{sublineSuffix}</span> : null}
						</span>
					</span>
				) : null}
			</span>
		</>
	);

	if (!href) {
		return <div className={pillClassName}>{content}</div>;
	}

	return (
		<NextLink
			href={href}
			className={cn(
				pillClassName,
				'hover:shadow-raised focus-visible:ring-ring transition-shadow focus-visible:ring-1 focus-visible:outline-hidden',
			)}
		>
			{content}
		</NextLink>
	);
};
