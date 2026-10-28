'use client';

import Image from 'next/image';
import { type ReactNode } from 'react';
import { cn } from '../../../cn';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../overlays/tool-tip/tool-tip';

type ImageHistoryProps = {
	items: { src: string; label: string; badge: string; tooltip?: string }[];
	selectedIndex: number;
	onSelect: (index: number) => void;
	label: string;
	disabled?: boolean;
	children: ReactNode;
};

export const ImageHistory = ({ items, selectedIndex, onSelect, label, disabled, children }: ImageHistoryProps) =>
	items.length === 0 ? (
		<>{children}</>
	) : (
		<div className="flex min-h-0 w-full min-w-0 flex-1 items-start gap-3 sm:gap-6">
			<nav aria-label={label} className="border-border w-16 shrink-0 border-r pr-2 sm:w-20 sm:pr-3">
				<ol className="flex max-h-[55vh] flex-col gap-3 overflow-y-auto p-1">
					{items.map((item, index) => (
						<li key={index}>
							<Tooltip delayDuration={500}>
								<TooltipTrigger asChild>
									<button
										type="button"
										aria-label={item.label}
										aria-current={index === selectedIndex ? 'true' : undefined}
										disabled={disabled}
										onClick={() => onSelect(index)}
										className={cn(
											'border-input bg-card focus-visible:ring-ring relative aspect-square w-full overflow-hidden rounded-lg border focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
											index === selectedIndex && 'ring-primary ring-2',
										)}
									>
										<Image src={item.src} alt="" fill sizes="64px" className="object-contain" unoptimized />
										<span
											className={cn(
												'text-2xs absolute right-0.5 bottom-0.5 rounded-full px-1.5 py-0.5 font-medium',
												index === selectedIndex ? 'bg-primary text-primary-foreground' : 'bg-card/90 text-foreground',
											)}
										>
											{item.badge}
										</span>
									</button>
								</TooltipTrigger>
								<TooltipContent side="right" sideOffset={8}>
									{item.tooltip ?? item.label}
								</TooltipContent>
							</Tooltip>
						</li>
					))}
				</ol>
			</nav>
			<div className="flex min-h-0 min-w-0 flex-1 flex-col self-stretch">{children}</div>
		</div>
	);
