'use client';

import { MobileDropdownItem } from '@/components/app-shells/website/navbar/mobile-dropdown-item';
import { MobileMenuItem } from '@/components/app-shells/website/navbar/mobile-menu-item';
import { SocialIncomeLogo } from '@/components/svg/social-income-logo';
import type { DropdownItem, Layout } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import { ChevronLeft, X } from 'lucide-react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { FC, startTransition, useCallback, useEffect, useState } from 'react';

const FALLBACK_BADGE_COUNT = 23;

type Props = {
	menu: Layout['menu'];
	lang: WebsiteLanguage;
	region: string;
};

export const MobileMenu: FC<Props> = ({ menu, lang, region }) => {
	const [open, setOpen] = useState(false);
	const [activeDropdown, setActiveDropdown] = useState<DropdownItem | null>(null);
	const pathname = usePathname();

	useEffect(() => {
		startTransition(() => {
			setOpen(false);
			setActiveDropdown(null);
		});
	}, [pathname]);

	useEffect(() => {
		document.body.style.overflow = open ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	const close = useCallback(() => {
		setOpen(false);
		setActiveDropdown(null);
	}, []);

	if (!open) {
		return (
			<button className="lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<line x1="3" y1="6" x2="21" y2="6" />
					<line x1="3" y1="12" x2="21" y2="12" />
					<line x1="3" y1="18" x2="21" y2="18" />
				</svg>
			</button>
		);
	}

	return (
		<div className="fixed inset-0 z-100 flex flex-col bg-white lg:hidden">
			{/* Header */}
			<div className="flex h-18 shrink-0 items-center justify-between px-4">
				<NextLink href={`/${lang}/${region}/${NEW_WEBSITE_SLUG}`} className="text-accent-foreground" onClick={close}>
					<SocialIncomeLogo />
				</NextLink>
				<button aria-label="Close menu" onClick={close}>
					<X className="size-6" />
				</button>
			</div>

			{/* Content area with slide transition */}
			<div className="relative flex-1 overflow-hidden">
				{/* Level 1 */}
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

							if (item.component === 'menuItem') {
								return <MobileMenuItem key={item._uid} item={item} lang={lang} region={region} onNavigate={close} />;
							}

							if (item.component === 'dropdownItem') {
								return <MobileDropdownItem key={item._uid} item={item} onSelect={setActiveDropdown} />;
							}

							return null;
						})}
					</ul>
				</div>

				{/* Level 2 */}
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
								Back
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
		</div>
	);
};
