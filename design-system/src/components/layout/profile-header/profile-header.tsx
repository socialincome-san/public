import NextImage from 'next/image';
import { type ReactNode } from 'react';
import { Stat } from '../../data-display/stat/stat';
import { TagList } from '../../data-display/tag-list/tag-list';
import { SectionHeading } from '../section-heading/section-heading';

type ProfileHeaderImage = {
	src: string;
	alt: string;
};

type ProfileHeaderFact = {
	label: string;
	value: string;
};

type ProfileHeaderProps = {
	name: string;
	description?: string;
	image?: ProfileHeaderImage | null;
	// Shown on the top left of the portrait, e.g. a duration badge
	imageBadge?: ReactNode;
	facts?: ProfileHeaderFact[];
	tags?: { label: string; items: string[] };
	// Shown last, e.g. links to social profiles
	actions?: ReactNode;
};

export const ProfileHeader = ({ name, description, image, imageBadge, facts, tags, actions }: ProfileHeaderProps) => (
	<header className="grid items-start gap-10 md:grid-cols-[minmax(0,1fr)_18rem] lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
		<div className="flex flex-col gap-8 max-md:order-2">
			<div className="flex flex-col gap-6">
				<SectionHeading as="h1" size={1} align="left" bold>
					{name}
				</SectionHeading>
				{description ? (
					<p className="text-foreground max-w-2xl text-lg leading-8 sm:text-xl sm:leading-9">{description}</p>
				) : null}
			</div>

			{facts && facts.length > 0 ? (
				<div className="flex flex-wrap gap-x-12 gap-y-4">
					{facts.map((fact) => (
						<Stat key={fact.label} label={fact.label} value={fact.value} size="lg" />
					))}
				</div>
			) : null}

			{tags && tags.items.length > 0 ? (
				<div className="flex flex-col gap-2">
					<p className="text-muted-foreground text-xs">{tags.label}</p>
					<TagList items={tags.items.map((label) => ({ label }))} ariaLabel={tags.label} />
				</div>
			) : null}

			{actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
		</div>

		{image ? (
			<div className="bg-muted shadow-card relative mx-auto aspect-4/5 w-64 overflow-hidden rounded-4xl md:w-full">
				{imageBadge ? <div className="absolute top-4 left-4 z-20">{imageBadge}</div> : null}
				<NextImage
					src={image.src}
					alt={image.alt}
					fill
					sizes="(min-width: 1024px) 352px, (min-width: 768px) 288px, 256px"
					className="object-cover object-top"
					priority
				/>
			</div>
		) : null}
	</header>
);
