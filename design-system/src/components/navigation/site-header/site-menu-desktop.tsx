'use client';

import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { ArrowRight, ChevronDown } from 'lucide-react';
import NextLink from 'next/link';
import { type PointerEvent, type ReactNode } from 'react';
import { type SiteMenuEntry } from './site-header';

// Dropdowns open on click only, so pointer movement must not toggle them
const preventHoverOpen = (event: PointerEvent) => {
	event.preventDefault();
};

type SiteMenuDesktopProps = {
	entries: SiteMenuEntry[];
	dropdownAside?: ReactNode;
};

export const SiteMenuDesktop = ({ entries, dropdownAside }: SiteMenuDesktopProps) => (
	<NavigationMenu.Root>
		<NavigationMenu.List className="flex items-center gap-1">
			{entries.map((entry) =>
				entry.type === 'link' ? (
					<NavigationMenu.Item key={entry.id}>
						<NavigationMenu.Link asChild className="group">
							<NextLink
								href={entry.href}
								target={entry.newTab ? '_blank' : '_self'}
								rel={entry.newTab ? 'noopener noreferrer' : undefined}
								className="hover:bg-muted flex items-center rounded-sm px-3 py-2 text-sm font-bold transition-colors"
							>
								{entry.label}
							</NextLink>
						</NavigationMenu.Link>
					</NavigationMenu.Item>
				) : (
					<NavigationMenu.Item key={entry.id}>
						<NavigationMenu.Trigger
							onPointerMove={preventHoverOpen}
							onPointerLeave={preventHoverOpen}
							className="hover:bg-muted group data-[state=open]:bg-muted flex items-center gap-1.5 rounded-sm px-3 py-2 text-sm font-bold transition-colors"
						>
							{entry.label}
							<ChevronDown className="size-3.5 transition-transform duration-150 group-data-[state=open]:rotate-180" />
						</NavigationMenu.Trigger>

						<NavigationMenu.Content
							onPointerEnter={preventHoverOpen}
							onPointerLeave={preventHoverOpen}
							className="bg-muted shadow-overlay rounded-3xl p-8"
						>
							<div className="flex items-start gap-10">
								<div className="grid flex-1 grid-cols-3 gap-8 p-8">
									{entry.groups.map((group) => (
										<div key={group.id} className="flex flex-col gap-4">
											<div className="text-lg leading-none font-bold">{group.label}</div>
											<div className="flex flex-col gap-2.5">
												{group.links.map((link) => (
													<NavigationMenu.Link key={link.id} asChild>
														<NextLink
															href={link.href}
															target={link.newTab ? '_blank' : '_self'}
															rel={link.newTab ? 'noopener noreferrer' : undefined}
															className="text-muted-foreground hover:text-foreground group flex w-fit items-center gap-2 font-medium transition-colors"
														>
															<span>{link.label}</span>
														</NextLink>
													</NavigationMenu.Link>
												))}
												{group.overview && (
													<NavigationMenu.Link asChild>
														<NextLink
															href={group.overview.href}
															className="text-muted-foreground hover:text-foreground group mt-3 inline-flex w-fit items-center gap-1.5 text-sm font-bold transition-colors"
														>
															<span>{group.overview.label}</span>
															<ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
														</NextLink>
													</NavigationMenu.Link>
												)}
											</div>
										</div>
									))}
								</div>
								<div className="w-96 shrink-0">{dropdownAside}</div>
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
