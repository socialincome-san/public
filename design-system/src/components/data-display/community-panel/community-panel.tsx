import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import NextLink from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '../../actions/button/button';
import { BackstagePanel } from '../../overlays/backstage/backstage';
import { AvatarStack } from '../avatar-stack/avatar-stack';
import { Badge } from '../badge/badge';
import { Card } from '../card/card';
import { ContributorsCard, type Contributor, type ContributorRole } from '../contributors-card/contributors-card';
import { PeopleStack } from '../people-stack/people-stack';

export type CommunityPanelLink = {
	label: string;
	href: string;
	ariaLabel?: string;
};

type CommunityPanelProps = {
	heading: string;
	headingEmphasis?: string;
	intro?: {
		before?: string;
		link?: CommunityPanelLink;
		after?: string;
	};
	contributors?: {
		roles: ContributorRole[];
		showMoreLabel: string;
		showLessLabel: string;
		feedback?: { text: string; action: CommunityPanelLink };
	};
	groups?: {
		title: string;
		lessLabel: string;
		items: { name: string; tag?: string; text?: string; people: Contributor[]; moreLabel: string }[];
	};
	roles?: {
		title: string;
		text?: string;
		items: { role: string; person: Contributor; action: CommunityPanelLink }[];
	};
	options?: {
		title: string;
		items: { name: string; effort?: string; href?: string }[];
		cta?: CommunityPanelLink;
	};
	links?: {
		title: string;
		items: { title: string; meta: string; href: string; imageSrc?: string }[];
	};
};

const ActionButton = ({ action, fullWidth }: { action: CommunityPanelLink; fullWidth?: boolean }) => (
	<Button asChild variant={fullWidth ? 'default' : 'outline'} size={fullWidth ? 'default' : 'sm'} fullWidth={fullWidth}>
		<NextLink href={action.href} aria-label={action.ariaLabel}>
			{action.label}
		</NextLink>
	</Button>
);

const Section = ({ title, text, children }: { title: string; text?: string; children: ReactNode }) => (
	<section className="flex flex-col gap-4">
		<div className="flex flex-col gap-1">
			<h3 className="text-foreground text-xl font-bold">{title}</h3>
			{text ? <p className="text-muted-foreground text-base">{text}</p> : null}
		</div>
		{children}
	</section>
);

export const CommunityPanel = ({
	heading,
	headingEmphasis,
	intro,
	contributors,
	groups,
	roles,
	options,
	links,
}: CommunityPanelProps) => (
	<BackstagePanel>
		<h2 className="text-3xl md:text-4xl">
			<span className="block">{heading}</span>
			{headingEmphasis ? <strong className="block font-bold">{headingEmphasis}</strong> : null}
		</h2>
		{intro || contributors ? (
			<div className="flex flex-col gap-3">
				{intro ? (
					<p className="text-base">
						{intro.before}
						{intro.link ? (
							<NextLink href={intro.link.href} className="text-foreground font-medium underline">
								{intro.link.label}
							</NextLink>
						) : null}
						{intro.after}
					</p>
				) : null}
				{contributors ? (
					<ContributorsCard
						roles={contributors.roles}
						showMoreLabel={contributors.showMoreLabel}
						showLessLabel={contributors.showLessLabel}
						footer={
							contributors.feedback ? (
								<div className="flex flex-wrap items-center justify-between gap-3">
									<span className="text-foreground text-base">{contributors.feedback.text}</span>
									<ActionButton action={contributors.feedback.action} />
								</div>
							) : undefined
						}
					/>
				) : null}
			</div>
		) : null}
		{groups && groups.items.length > 0 ? (
			<Section title={groups.title}>
				{groups.items.map((group, index) => (
					<Card key={index} padding="compact">
						<div className="flex flex-col gap-3">
							<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
								<span className="text-foreground text-xl font-bold">{group.name}</span>
								{group.tag ? <Badge>{group.tag}</Badge> : null}
							</div>
							{group.text ? <p className="text-foreground text-base">{group.text}</p> : null}
							{group.people.length > 0 ? (
								<PeopleStack people={group.people} moreLabel={group.moreLabel} lessLabel={groups.lessLabel} />
							) : null}
						</div>
					</Card>
				))}
			</Section>
		) : null}
		{roles && roles.items.length > 0 ? (
			<Section title={roles.title} text={roles.text}>
				<Card padding="compact">
					<ul className="flex flex-col">
						{roles.items.map(({ role, person, action }, index) => (
							<li
								key={index}
								className="border-border flex items-center gap-4 border-b py-3 first:pt-0 last:border-b-0 last:pb-0"
							>
								<AvatarStack people={[person]} size="xl" />
								<span className="flex min-w-0 flex-1 flex-col gap-0.5">
									<span className="text-foreground text-base font-medium">{role}</span>
									{person.href ? (
										<NextLink
											href={person.href}
											className="text-muted-foreground hover:text-foreground text-base hover:underline"
										>
											{person.name}
										</NextLink>
									) : (
										<span className="text-muted-foreground text-base">{person.name}</span>
									)}
								</span>
								<ActionButton action={action} />
							</li>
						))}
					</ul>
				</Card>
			</Section>
		) : null}
		{options && options.items.length > 0 ? (
			<Section title={options.title}>
				<Card padding="compact">
					<div className="flex flex-col gap-4">
						<dl className="flex flex-col">
							{options.items.map((option, index) => (
								<div
									key={index}
									className="border-border flex items-baseline justify-between gap-4 border-b py-2 last:border-b-0"
								>
									<dt className="text-base">
										{option.href ? (
											<NextLink href={option.href} className="hover:underline">
												{option.name}
											</NextLink>
										) : (
											option.name
										)}
									</dt>
									{option.effort ? <dd className="text-muted-foreground shrink-0 text-sm">{option.effort}</dd> : null}
								</div>
							))}
						</dl>
						{options.cta ? <ActionButton action={options.cta} fullWidth /> : null}
					</div>
				</Card>
			</Section>
		) : null}
		{links && links.items.length > 0 ? (
			<Section title={links.title}>
				{links.items.map((item) => (
					<NextLink
						key={item.href}
						href={item.href}
						className="bg-card border-border flex items-center gap-4 rounded-2xl border p-4 shadow-lg transition-transform hover:-translate-y-0.5 motion-reduce:transition-none"
					>
						{item.imageSrc ? (
							<Image
								src={item.imageSrc}
								alt=""
								width={128}
								height={128}
								className="size-16 shrink-0 rounded-lg object-cover"
							/>
						) : (
							<span className="bg-muted size-16 shrink-0 rounded-lg" />
						)}
						<span className="flex min-w-0 flex-1 flex-col gap-1">
							<span className="text-foreground text-base leading-snug font-semibold">{item.title}</span>
							<span className="text-muted-foreground text-sm">{item.meta}</span>
						</span>
						<ChevronRight className="text-muted-foreground size-5 shrink-0" aria-hidden="true" />
					</NextLink>
				))}
			</Section>
		) : null}
	</BackstagePanel>
);
