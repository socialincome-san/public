'use client';

import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import NextLink from 'next/link';
import { type PointerEvent } from 'react';
import { cn } from '../../../cn';
import { Badge } from '../../data-display/badge/badge';
import { CountryFlag } from '../../data-display/country-flag/country-flag';
import { type SiteMenuEntry, type SiteMenuFooter, type SiteMenuGroup, type SiteMenuLink } from './site-header';

// Dropdowns open on click only, so pointer movement must not toggle them
const preventHoverOpen = (event: PointerEvent) => {
	event.preventDefault();
};

const itemClassName =
	'hover:bg-muted data-[state=open]:bg-muted flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold transition-colors';

const columnSurfaces = ['bg-card', 'bg-backstage', 'bg-banner-yellow'];

const linkTarget = ({ newTab }: Pick<SiteMenuLink, 'newTab'>) =>
	newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {};

const ArrowLink = ({ label, href, muted = false }: { label: string; href: string; muted?: boolean }) => (
	<NavigationMenu.Link asChild>
		<NextLink
			href={href}
			className={cn(
				'hover:text-foreground group inline-flex items-center gap-1.5 text-sm font-bold transition-colors',
				muted && 'text-muted-foreground',
			)}
		>
			{label}
			<ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
		</NextLink>
	</NavigationMenu.Link>
);

const RowLink = ({ link }: { link: SiteMenuLink }) => {
	const className = 'group flex w-full items-center justify-between gap-2 py-2 text-left text-sm font-bold';
	const content = (
		<>
			{link.label}
			<ArrowRight className="size-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
		</>
	);

	return (
		<NavigationMenu.Link asChild>
			{link.onSelect ? (
				<button type="button" aria-haspopup="dialog" className={className} onClick={link.onSelect}>
					{content}
				</button>
			) : (
				<NextLink href={link.href} {...linkTarget(link)} className={className}>
					{content}
				</NextLink>
			)}
		</NavigationMenu.Link>
	);
};

const GroupColumn = ({ group, surface }: { group: SiteMenuGroup; surface?: string }) => (
	<section className={cn('flex flex-col gap-4 p-8', surface)}>
		<div className="flex justify-between gap-4">
			<div className="flex flex-col items-start gap-4">
				<h3 className="text-primary text-2xl">{group.label}</h3>
				{group.badge && <Badge variant="primary-outline">{group.badge}</Badge>}
			</div>
			{group.illustrationSrc && (
				<Image src={group.illustrationSrc} alt="" width={112} height={112} className="size-28 object-contain" />
			)}
		</div>
		<ul className="divide-border border-border divide-y border-y">
			{group.links.map((link) => (
				<li key={link.id}>
					<RowLink link={link} />
				</li>
			))}
		</ul>
		{group.overview && (
			<div className="mt-2">
				<ArrowLink {...group.overview} />
			</div>
		)}
	</section>
);

const DropdownFooter = ({ footer }: { footer: SiteMenuFooter }) => (
	<div className="flex items-center gap-3 px-8 py-4">
		{footer.label && <span className="text-sm font-bold">{footer.label}</span>}
		{footer.countries && (
			<ul className="flex flex-1 items-center gap-6">
				{footer.countries.map((country) => (
					<li key={country.id}>
						<NavigationMenu.Link asChild>
							<NextLink
								href={country.href}
								className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-bold transition-colors"
							>
								<CountryFlag country={country.country} size="sm" decorative />
								{country.label}
							</NextLink>
						</NavigationMenu.Link>
					</li>
				))}
			</ul>
		)}
		{footer.overview && <ArrowLink {...footer.overview} muted />}
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
							<NextLink href={entry.href} {...linkTarget(entry)} className={itemClassName}>
								{entry.label}
							</NextLink>
						</NavigationMenu.Link>
					</NavigationMenu.Item>
				) : (
					<NavigationMenu.Item key={entry.id}>
						<NavigationMenu.Trigger
							onPointerMove={preventHoverOpen}
							onPointerLeave={preventHoverOpen}
							className={cn('group', itemClassName)}
						>
							{entry.label}
							<ChevronDown className="size-3.5 transition-transform duration-150 group-data-[state=open]:rotate-180" />
						</NavigationMenu.Trigger>

						<NavigationMenu.Content onPointerEnter={preventHoverOpen} onPointerLeave={preventHoverOpen}>
							{/* The footer is the secondary base showing below the rounded columns */}
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
										<GroupColumn key={group.id} group={group} surface={columnSurfaces[index % columnSurfaces.length]} />
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
