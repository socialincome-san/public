'use client';

import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import NextLink from 'next/link';
import { type PointerEvent } from 'react';
import { cn } from '../../../cn';
import { Badge } from '../../data-display/badge/badge';
import { CountryFlag } from '../../data-display/country-flag/country-flag';
import { type SiteMenuDropdownFooter, type SiteMenuEntry, type SiteMenuGroup, type SiteMenuLink } from './site-header';

// Dropdowns open on click only, so pointer movement must not toggle them
const preventHoverOpen = (event: PointerEvent) => {
	event.preventDefault();
};

const triggerClassName =
	'hover:bg-muted data-[state=open]:bg-muted flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold transition-colors';

// Applied to the columns left to right
const columnSurfaces = ['bg-card', 'bg-backstage', 'bg-banner-yellow'];

const rowClassName =
	'group border-border flex w-full items-center justify-between gap-2 border-t py-2 text-left text-sm font-bold';

const overviewClassName =
	'text-muted-foreground hover:text-foreground group inline-flex w-fit items-center gap-1.5 text-sm font-bold transition-colors';

const linkTarget = (link: Pick<SiteMenuLink, 'newTab'>) => ({
	target: link.newTab ? '_blank' : '_self',
	rel: link.newTab ? 'noopener noreferrer' : undefined,
});

const OverviewLink = ({ label, href, emphasized }: { label: string; href: string; emphasized?: boolean }) => (
	<NavigationMenu.Link asChild>
		<NextLink href={href} className={cn(overviewClassName, emphasized && 'text-foreground')}>
			<span>{label}</span>
			<ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
		</NextLink>
	</NavigationMenu.Link>
);

const RowLink = ({ link }: { link: SiteMenuLink }) => {
	const content = (
		<>
			{link.label}
			<ArrowRight className="size-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
		</>
	);

	return (
		<NavigationMenu.Link asChild>
			{link.onSelect ? (
				<button type="button" aria-haspopup="dialog" className={rowClassName} onClick={link.onSelect}>
					{content}
				</button>
			) : (
				<NextLink href={link.href} {...linkTarget(link)} className={rowClassName}>
					{content}
				</NextLink>
			)}
		</NavigationMenu.Link>
	);
};

const GroupColumn = ({ group, surface }: { group: SiteMenuGroup; surface: string }) => (
	<section
		className={cn(
			'grid content-start gap-x-4 p-8',
			group.illustrationSrc ? 'grid-cols-[minmax(0,1fr)_7rem]' : 'grid-cols-1',
			surface,
		)}
	>
		<div className="col-start-1 row-start-1 flex flex-col items-start gap-4">
			<span className="text-primary text-2xl">{group.label}</span>
			{group.subtitle && <Badge variant="primary-outline">{group.subtitle}</Badge>}
		</div>
		{group.illustrationSrc && (
			<Image
				src={group.illustrationSrc}
				alt=""
				width={112}
				height={112}
				className="col-start-2 row-start-1 size-28 object-contain"
			/>
		)}
		<ul className="col-span-full mt-4 flex flex-col [&>li:last-child>*]:border-b">
			{group.links.map((link) => (
				<li key={link.id}>
					<RowLink link={link} />
				</li>
			))}
		</ul>
		{group.overview && (
			<div className="col-span-full mt-6">
				<OverviewLink label={group.overview.label} href={group.overview.href} emphasized />
			</div>
		)}
	</section>
);

const DropdownFooter = ({ footer }: { footer: SiteMenuDropdownFooter }) => (
	<div className="flex items-center gap-6 px-8 py-4">
		{footer.href ? (
			<OverviewLink label={footer.label} href={footer.href} />
		) : (
			<span className="text-sm font-bold">{footer.label}</span>
		)}
		{footer.countries && footer.countries.length > 0 && (
			// Closer to the label than to each other, so the label reads as their introduction
			<div className="-ml-3 flex items-center gap-6">
				{footer.countries.map((country) => (
					<NavigationMenu.Link key={country.id} asChild>
						<NextLink
							href={country.href}
							className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-bold transition-colors"
						>
							<CountryFlag country={country.country} size="sm" decorative />
							{country.label}
						</NextLink>
					</NavigationMenu.Link>
				))}
			</div>
		)}
		{footer.overview && (
			<div className={footer.overviewInline ? '-ml-3' : 'ml-auto'}>
				<OverviewLink label={footer.overview.label} href={footer.overview.href} />
			</div>
		)}
	</div>
);

type SiteMenuDesktopProps = {
	entries: SiteMenuEntry[];
};

export const SiteMenuDesktop = ({ entries }: SiteMenuDesktopProps) => (
	<NavigationMenu.Root>
		<NavigationMenu.List className="flex items-center gap-1">
			{entries.map((entry) =>
				entry.type === 'link' ? (
					<NavigationMenu.Item key={entry.id}>
						<NavigationMenu.Link asChild>
							<NextLink href={entry.href} {...linkTarget(entry)} className={triggerClassName}>
								{entry.label}
							</NextLink>
						</NavigationMenu.Link>
					</NavigationMenu.Item>
				) : (
					<NavigationMenu.Item key={entry.id}>
						<NavigationMenu.Trigger
							onPointerMove={preventHoverOpen}
							onPointerLeave={preventHoverOpen}
							className={cn('group', triggerClassName)}
						>
							{entry.label}
							<ChevronDown className="size-3.5 transition-transform duration-150 group-data-[state=open]:rotate-180" />
						</NavigationMenu.Trigger>

						<NavigationMenu.Content onPointerEnter={preventHoverOpen} onPointerLeave={preventHoverOpen}>
							{/* The columns sit as one rounded card on the secondary base, which shows through as the footer */}
							<div
								className={cn(
									'shadow-overlay flex min-h-112 flex-col overflow-hidden rounded-3xl',
									entry.footer && 'bg-secondary',
								)}
							>
								<div
									className={cn(
										'grid flex-1 grid-cols-3 overflow-hidden rounded-3xl',
										entry.footer && 'border-border border-b shadow-xs',
									)}
								>
									{entry.groups.map((group, index) => (
										<GroupColumn
											key={group.id}
											group={group}
											surface={columnSurfaces[index % columnSurfaces.length] ?? 'bg-card'}
										/>
									))}
								</div>
								{entry.footer && <DropdownFooter footer={entry.footer} />}
							</div>
						</NavigationMenu.Content>
					</NavigationMenu.Item>
				),
			)}
		</NavigationMenu.List>
		<NavigationMenu.Viewport
			onPointerEnter={preventHoverOpen}
			onPointerLeave={preventHoverOpen}
			className="data-[state=closed]:animate-fade-out data-[state=open]:animate-enter-from-top absolute inset-x-0 top-[calc(100%+1rem)] z-50 w-full"
		/>
	</NavigationMenu.Root>
);
