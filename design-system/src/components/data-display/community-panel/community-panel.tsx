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
	maintainers?: {
		roles: ContributorRole[];
		showMoreLabel: string;
		showLessLabel: string;
		mistake?: { text: string; action: CommunityPanelLink };
	};
	worlds?: {
		title: string;
		lessLabel: string;
		items: { name: string; tag?: string; text?: string; people: Contributor[]; moreLabel: string }[];
	};
	roles?: {
		title: string;
		text?: string;
		items: { role: string; person: Contributor; action: CommunityPanelLink }[];
	};
	waysIn?: {
		title: string;
		items: { name: string; effort?: string; href?: string }[];
		cta?: CommunityPanelLink;
	};
	reading?: {
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
	maintainers,
	worlds,
	roles,
	waysIn,
	reading,
}: CommunityPanelProps) => (
	<BackstagePanel>
		<h2 className="text-3xl md:text-4xl">
			<span className="block">{heading}</span>
			{headingEmphasis ? <strong className="block font-bold">{headingEmphasis}</strong> : null}
		</h2>
		{intro || maintainers ? (
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
				{maintainers ? (
					<ContributorsCard
						roles={maintainers.roles}
						showMoreLabel={maintainers.showMoreLabel}
						showLessLabel={maintainers.showLessLabel}
						footer={
							maintainers.mistake ? (
								<div className="flex flex-wrap items-center justify-between gap-3">
									<span className="text-foreground text-base">{maintainers.mistake.text}</span>
									<ActionButton action={maintainers.mistake.action} />
								</div>
							) : undefined
						}
					/>
				) : null}
			</div>
		) : null}
		{worlds && worlds.items.length > 0 ? (
			<Section title={worlds.title}>
				{worlds.items.map((world, index) => (
					<Card key={index} padding="compact">
						<div className="flex flex-col gap-3">
							<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
								<span className="text-foreground text-xl font-bold">{world.name}</span>
								{world.tag ? <Badge>{world.tag}</Badge> : null}
							</div>
							{world.text ? <p className="text-foreground text-base">{world.text}</p> : null}
							{world.people.length > 0 ? (
								<PeopleStack people={world.people} moreLabel={world.moreLabel} lessLabel={worlds.lessLabel} />
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
		{waysIn && waysIn.items.length > 0 ? (
			<Section title={waysIn.title}>
				<Card padding="compact">
					<div className="flex flex-col gap-4">
						<dl className="flex flex-col">
							{waysIn.items.map((way, index) => (
								<div
									key={index}
									className="border-border flex items-baseline justify-between gap-4 border-b py-2 last:border-b-0"
								>
									<dt className="text-base">
										{way.href ? (
											<NextLink href={way.href} className="hover:underline">
												{way.name}
											</NextLink>
										) : (
											way.name
										)}
									</dt>
									{way.effort ? <dd className="text-muted-foreground shrink-0 text-sm">{way.effort}</dd> : null}
								</div>
							))}
						</dl>
						{waysIn.cta ? <ActionButton action={waysIn.cta} fullWidth /> : null}
					</div>
				</Card>
			</Section>
		) : null}
		{reading && reading.items.length > 0 ? (
			<Section title={reading.title}>
				{reading.items.map((item) => (
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
