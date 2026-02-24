'use client';

import { hasDropdownChildren, isDropdownItem, isMenuItem } from '@/components/app-shells/website/navbar/utils';
import { Button } from '@/components/button';
import { SocialIncomeLogo } from '@/components/svg/social-income-logo';
import type { DropdownItem, Layout } from '@/generated/storyblok/types/109655/storyblok-components';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, useCallback, useEffect, useState } from 'react';

const FALLBACK_BADGE_COUNT = 23;

type Props = {
	menu: Layout['menu'];
	lang: WebsiteLanguage;
	region: string;
};

export const MenuMobile: FC<Props> = ({ menu, lang, region }) => {
	const commonTranslator = useTranslator(lang, 'website-common');
	const donateTranslator = useTranslator(lang, 'website-donate');
	const [open, setOpen] = useState(false);
	const [activeDropdown, setActiveDropdown] = useState<DropdownItem | null>(null);
	const pathname = usePathname();

	useEffect(() => {
		setOpen(false);
		setActiveDropdown(null);
	}, [pathname]);

	const handleOpenChange = useCallback((nextOpen: boolean) => {
		setOpen(nextOpen);
		if (!nextOpen) {
			setActiveDropdown(null);
		}
	}, []);

	const close = useCallback(() => handleOpenChange(false), [handleOpenChange]);

	return (
		<Dialog.Root open={open} onOpenChange={handleOpenChange}>
			{open ? (
				<Dialog.Close className="lg:hidden" aria-label={commonTranslator?.t('menu.close') ?? 'Close menu'}>
					<X className="size-6" />
				</Dialog.Close>
			) : (
				<Dialog.Trigger className="lg:hidden" aria-label={commonTranslator?.t('menu.open') ?? 'Open menu'}>
					<Menu className="size-6" />
				</Dialog.Trigger>
			)}

			<Dialog.Portal>
				<Dialog.Overlay className="theme-new text-foreground fixed inset-0 z-100 overflow-y-auto bg-white lg:hidden">
					<Dialog.Content className="flex min-h-full flex-col">
						<Dialog.Title className="sr-only">{commonTranslator?.t('menu.title') ?? 'Menu'}</Dialog.Title>
						<div className="border-muted mb-4 flex h-18 shrink-0 items-center justify-between border-b px-4">
							<NextLink
								href={`/${lang}/${region}/${NEW_WEBSITE_SLUG}`}
								className="text-accent-foreground"
								onClick={close}
							>
								<SocialIncomeLogo />
							</NextLink>
							<Dialog.Close aria-label={commonTranslator?.t('menu.close') ?? 'Close menu'}>
								<X className="size-6" />
							</Dialog.Close>
						</div>

						<div className="relative flex-1 overflow-hidden">
							<div
								className={cn(
									'absolute inset-0 overflow-y-auto px-4 transition-transform duration-300 ease-in-out',
									activeDropdown ? '-translate-x-full' : 'translate-x-0',
								)}
							>
								<ul>
									{menu.map((item) => {
										if (!item.label) {
											return null;
										}

										if (isMenuItem(item)) {
											return (
												<li key={item._uid}>
													<NextLink
														href={resolveStoryblokLink(item.link, lang, region)}
														target={item.newTab ? '_blank' : undefined}
														rel={item.newTab ? 'noopener noreferrer' : undefined}
														className="block py-5 text-xl font-medium"
													>
														{item.label}
													</NextLink>
												</li>
											);
										}

										if (isDropdownItem(item) && hasDropdownChildren(item)) {
											return (
												<li key={item._uid}>
													<button
														className="flex w-full items-center justify-between py-5 text-xl font-medium"
														onClick={() => setActiveDropdown(item)}
													>
														{item.label}
														<ChevronRight className="size-5 shrink-0" />
													</button>
												</li>
											);
										}

										return null;
									})}
								</ul>
							</div>

							<div
								className={cn(
									'absolute inset-0 overflow-y-auto px-4 transition-transform duration-300 ease-in-out',
									activeDropdown ? 'translate-x-0' : 'translate-x-full',
								)}
							>
								{activeDropdown && (
									<>
										<button
											className="flex items-center gap-1 py-3 text-sm font-medium"
											onClick={() => setActiveDropdown(null)}
										>
											<ChevronLeft className="size-4" />
											{commonTranslator?.t('menu.back') ?? 'Back'}
										</button>

										<h2 className="mb-4 text-2xl font-bold">{activeDropdown.label}</h2>

										{activeDropdown.menuItemGroups.map((group) => (
											<div key={group._uid} className="mb-6">
												<h3 className="mb-2 text-sm font-bold">{group.label}</h3>
												<ul className="flex flex-col gap-2">
													{group.items?.map((child) => (
														<li key={child._uid}>
															<NextLink
																href={resolveStoryblokLink(child.link, lang, region)}
																target={child.newTab ? '_blank' : undefined}
																rel={child.newTab ? 'noopener noreferrer' : undefined}
																className="text-muted-foreground flex items-center gap-2 font-medium"
																onClick={close}
															>
																{child.label}
																<span className="rounded-full border border-slate-300 px-2 py-0.5 text-[10px] leading-none font-semibold text-slate-500">
																	{FALLBACK_BADGE_COUNT}
																</span>
															</NextLink>
														</li>
													))}
												</ul>
											</div>
										))}
									</>
								)}
							</div>
						</div>
						<div className="border-muted flex h-18 shrink-0 items-center justify-between border-t px-4 shadow-[0_-3px_14px_rgba(0,0,0,0.05)]">
							<Button className="h-11 rounded-full px-5 text-sm font-medium">
								{donateTranslator?.t('donation-form.donate-now') ?? 'Donate now'}
							</Button>
						</div>
					</Dialog.Content>
				</Dialog.Overlay>
			</Dialog.Portal>
		</Dialog.Root>
	);
};
