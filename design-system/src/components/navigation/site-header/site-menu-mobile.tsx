'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { ArrowRight, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import NextLink from 'next/link';
import { type ReactNode, useState } from 'react';
import { cn } from '../../../cn';
import { SocialIncomeLogo } from '../../brand/logo/logo';
import { type SiteMenuEntry } from './site-header';

type DropdownEntry = Extract<SiteMenuEntry, { type: 'dropdown' }>;

export type SiteMenuMobileLabels = {
	openMenu: string;
	closeMenu: string;
	title: string;
	back: string;
	homeLink: string;
};

type SiteMenuMobileProps = {
	entries: SiteMenuEntry[];
	homeHref: string;
	labels: SiteMenuMobileLabels;
	footerControls: ReactNode;
	renderDonateAction?: (closeMenu: () => void) => ReactNode;
};

export const SiteMenuMobile = ({ entries, homeHref, labels, footerControls, renderDonateAction }: SiteMenuMobileProps) => {
	const [open, setOpen] = useState(false);
	const [activeDropdown, setActiveDropdown] = useState<DropdownEntry | null>(null);

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen);
		if (!nextOpen) {
			setActiveDropdown(null);
		}
	};

	const closeMenu = () => handleOpenChange(false);

	return (
		<Dialog.Root open={open} onOpenChange={handleOpenChange}>
			{open ? (
				<Dialog.Close className="lg:hidden" aria-label={labels.closeMenu}>
					<X className="size-6" />
				</Dialog.Close>
			) : (
				<Dialog.Trigger className="lg:hidden" aria-label={labels.openMenu}>
					<Menu className="size-6" />
				</Dialog.Trigger>
			)}

			<Dialog.Portal>
				<Dialog.Overlay className="text-foreground bg-background fixed inset-0 z-100 overflow-y-auto lg:hidden">
					<Dialog.Content className="flex min-h-full flex-col">
						<Dialog.Title className="sr-only">{labels.title}</Dialog.Title>
						<div className="border-muted mb-4 flex h-18 shrink-0 items-center justify-between border-b px-4">
							<NextLink href={homeHref} className="text-accent-foreground" aria-label={labels.homeLink} onClick={closeMenu}>
								<SocialIncomeLogo decorative />
							</NextLink>
							<Dialog.Close aria-label={labels.closeMenu}>
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
									{entries.map((entry) => (
										<li key={entry.id}>
											{entry.type === 'link' ? (
												<NextLink
													href={entry.href}
													target={entry.newTab ? '_blank' : undefined}
													rel={entry.newTab ? 'noopener noreferrer' : undefined}
													className="block py-5 text-xl font-medium"
													onClick={closeMenu}
												>
													{entry.label}
												</NextLink>
											) : (
												<button
													className="flex w-full items-center justify-between py-5 text-xl font-medium"
													onClick={() => setActiveDropdown(entry)}
												>
													{entry.label}
													<ChevronRight className="size-5 shrink-0" />
												</button>
											)}
										</li>
									))}
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
											className="mb-4 flex items-center gap-1 py-4 text-sm font-medium"
											onClick={() => setActiveDropdown(null)}
										>
											<ChevronLeft className="size-4" />
											{labels.back}
										</button>

										<h2 className="mb-4 text-xl font-medium">{activeDropdown.label}</h2>

										{activeDropdown.groups.map((group) => (
											<div key={group.id} className="mb-6">
												<h3 className="mb-2 font-bold">{group.label}</h3>
												<ul className="flex flex-col gap-2">
													{group.links.map((link) => (
														<li key={link.id}>
															<NextLink
																href={link.href}
																target={link.newTab ? '_blank' : undefined}
																rel={link.newTab ? 'noopener noreferrer' : undefined}
																className="text-muted-foreground flex items-center gap-2 text-sm font-medium"
																onClick={closeMenu}
															>
																{link.label}
															</NextLink>
														</li>
													))}
												</ul>
												{group.overview && (
													<NextLink
														href={group.overview.href}
														className="text-muted-foreground hover:text-foreground group mt-4 inline-flex items-center gap-1.5 text-sm font-bold transition-colors"
														onClick={closeMenu}
													>
														<span>{group.overview.label}</span>
														<ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
													</NextLink>
												)}
											</div>
										))}
									</>
								)}
							</div>
						</div>
						<div className="border-muted shadow-card flex h-18 shrink-0 items-center justify-between gap-2 border-t px-4">
							{renderDonateAction?.(closeMenu)}
							<div className="flex min-w-0 items-center gap-2">{footerControls}</div>
						</div>
					</Dialog.Content>
				</Dialog.Overlay>
			</Dialog.Portal>
		</Dialog.Root>
	);
};
