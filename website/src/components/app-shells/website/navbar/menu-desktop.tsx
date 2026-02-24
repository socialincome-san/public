'use client';

import { hasDropdownChildren, isDropdownItem, isMenuItem } from '@/components/app-shells/website/navbar/utils';
import { MakeDonationForm } from '@/components/make-donation-form';
import { Layout } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { ChevronDown } from 'lucide-react';
import NextLink from 'next/link';

type Props = {
	menu: Layout['menu'];
	lang: WebsiteLanguage;
	region: string;
};

const FALLBACK_BADGE_COUNT = 23;

export const MenuDesktop = ({ menu, lang, region }: Props) => (
	<NavigationMenu.Root>
		<NavigationMenu.List className="flex items-center gap-1">
			{menu.map((item) => {
				if (!item.label) {
					return null;
				}

				if (isMenuItem(item)) {
					const href = resolveStoryblokLink(item.link, lang, region);

					return (
						<NavigationMenu.Item key={item._uid}>
							<NavigationMenu.Link asChild className="group">
								<NextLink
									href={href}
									target={item.newTab ? '_blank' : '_self'}
									rel={item.newTab ? 'noopener noreferrer' : undefined}
									className="hover:bg-muted flex items-center rounded-sm px-3 py-2 text-sm font-semibold transition-colors"
								>
									{item.label}
								</NextLink>
							</NavigationMenu.Link>
						</NavigationMenu.Item>
					);
				}

				if (!isDropdownItem(item)) {
					return null;
				}

				if (!hasDropdownChildren(item)) {
					return null;
				}

				return (
					<NavigationMenu.Item key={item._uid}>
						<NavigationMenu.Trigger
							className={cn(
								'hover:bg-muted group flex items-center gap-1.5 rounded-sm px-3 py-2 text-sm font-semibold transition-colors',
								'data-[state=open]:bg-muted',
							)}
						>
							{item.label}
							<ChevronDown className="size-3.5 transition-transform duration-150 group-data-[state=open]:rotate-180" />
						</NavigationMenu.Trigger>

						<NavigationMenu.Content className="bg-muted rounded-3xl p-8 shadow-[0_24px_48px_rgba(15,23,42,0.16)]">
							<div className="flex items-start gap-10">
								<div className="grid flex-1 grid-cols-3 gap-8 p-8">
									{item.menuItemGroups.map((group) => (
										<div key={group._uid} className="flex flex-col gap-4">
											<div className="text-lg leading-none font-bold">{group.label}</div>
											<div className="flex flex-col gap-2.5">
												{group.items?.map((child) => (
													<NavigationMenu.Link key={child._uid} asChild>
														<NextLink
															href={resolveStoryblokLink(child.link, lang, region)}
															target={child.newTab ? '_blank' : '_self'}
															rel={child.newTab ? 'noopener noreferrer' : undefined}
															className="text-muted-foreground hover:text-foreground group flex w-fit items-center gap-2 font-medium transition-colors"
														>
															<span>{child.label}</span>
															<span className="rounded-full border border-slate-300 px-2 py-0.5 text-[10px] leading-none font-semibold text-slate-500">
																{FALLBACK_BADGE_COUNT}
															</span>
														</NextLink>
													</NavigationMenu.Link>
												))}
											</div>
										</div>
									))}
								</div>
								<div className="w-96 shrink-0">
									<MakeDonationForm lang={lang} />
								</div>
							</div>
						</NavigationMenu.Content>
					</NavigationMenu.Item>
				);
			})}
		</NavigationMenu.List>
		<NavigationMenu.Viewport className="data-[state=closed]:animate-fade-out data-[state=open]:animate-enter-from-top absolute inset-x-0 top-[calc(100%+1rem)] z-50 w-full" />
	</NavigationMenu.Root>
);
