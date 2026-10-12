import NextImage from 'next/image';
import { Children, type ReactNode } from 'react';
import { cn } from '../../../cn';
import { SectionHeading } from '../section-heading/section-heading';

type ProfileHeaderImage = {
	src: string;
	alt: string;
};

type ProfileHeaderProps = {
	name: string;
	image?: ProfileHeaderImage | null;
	// Shown on the top left of the portrait, e.g. a duration badge
	imageBadge?: ReactNode;
	// Shown below the name, e.g. links to social profiles
	actions?: ReactNode;
	description?: string;
	// Fact cards
	children?: ReactNode;
};

export const ProfileHeader = ({ name, image, imageBadge, actions, description, children }: ProfileHeaderProps) => {
	const facts = Children.toArray(children);
	const count = facts.length;

	return (
		<header className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
			{image && (
				<div className="bg-muted relative mx-auto aspect-4/5 w-44 shrink-0 overflow-hidden rounded-2xl sm:mx-0 sm:w-48">
					{imageBadge && <div className="absolute top-3 left-3 z-20">{imageBadge}</div>}
					<NextImage
						src={image.src}
						alt={image.alt}
						fill
						sizes="(min-width: 640px) 192px, 176px"
						className="object-cover object-top"
						priority
					/>
				</div>
			)}

			<div className="flex min-w-0 flex-1 flex-col gap-6 text-center sm:text-left">
				<div className="flex flex-col gap-4">
					<SectionHeading as="h1" size={1} align="left" bold>
						{name}
					</SectionHeading>
					{actions && <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">{actions}</div>}
				</div>

				{/* All facts share a row where there is room; in between, an odd last fact spans a row of its own.
				A lone fact fills the row rather than leaving half of it empty. */}
				{count > 0 && (
					<div className={cn('grid gap-4 text-left', count > 1 && 'sm:grid-cols-2', count > 2 && 'lg:grid-cols-3')}>
						{facts.map((fact, index) => (
							<div
								key={index}
								className={cn(count > 1 && count % 2 === 1 && index === count - 1 && 'sm:col-span-2 lg:col-span-1')}
							>
								{fact}
							</div>
						))}
					</div>
				)}

				{description && (
					<p className="text-foreground max-w-2xl text-base leading-7 sm:text-lg sm:leading-8">{description}</p>
				)}
			</div>
		</header>
	);
};
