import { Home } from 'lucide-react';
import React from 'react';

import {
	BreadcrumbElements,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from './breadcrumb-elements';

export type BreadcrumbLinkItem = {
	label: string;
	href: string;
};

export const truncateBreadcrumbLabel = (label: string, limit: number) => {
	if (label.length <= limit) {
		return label;
	}

	const words = label.split(/\s+/);
	if (words.length === 1) {
		return `${label.slice(0, limit)}…`;
	}

	let truncated = '';
	for (const [index, word] of words.entries()) {
		const next = truncated ? `${truncated} ${word}` : word;
		if (next.length > limit) {
			if (index < words.length - 1) {
				truncated = next;
			}
			break;
		}
		truncated = next;
	}

	return truncated ? `${truncated}…` : `${label.slice(0, limit)}…`;
};

const getBreadcrumbLimit = () =>
	typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(min-width: 64rem)').matches
		? 20
		: 12;

const BreadcrumbLabel = ({ label }: { label: string }) => {
	const labelRef = React.useRef<HTMLSpanElement>(null);
	const fullLabelRef = React.useRef<HTMLSpanElement>(null);
	const truncatedLabelRef = React.useRef<HTMLSpanElement>(null);
	const ellipsisRef = React.useRef<HTMLSpanElement>(null);
	const [displayLabel, setDisplayLabel] = React.useState(label);

	React.useLayoutEffect(() => {
		const updateLabel = () => {
			const element = labelRef.current;
			if (!element || element.clientWidth === 0) {
				return;
			}

			const truncatedLabel = truncateBreadcrumbLabel(label, getBreadcrumbLimit());
			const fits = (candidate: HTMLSpanElement | null) => candidate !== null && candidate.offsetWidth <= element.clientWidth;

			setDisplayLabel(
				fits(fullLabelRef.current)
					? label
					: fits(truncatedLabelRef.current)
						? truncatedLabel
						: fits(ellipsisRef.current)
							? '…'
							: '',
			);
		};

		updateLabel();
		const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateLabel);
		if (observer && labelRef.current) {
			observer.observe(labelRef.current);
		}
		window.addEventListener('resize', updateLabel);

		return () => {
			observer?.disconnect();
			window.removeEventListener('resize', updateLabel);
		};
	}, [label]);

	return (
		<span
			ref={labelRef}
			title={label}
			aria-label={label}
			className="relative block min-w-0 overflow-hidden whitespace-nowrap"
		>
			{displayLabel}
			<span ref={fullLabelRef} aria-hidden="true" className="invisible absolute whitespace-nowrap">
				{label}
			</span>
			<span ref={truncatedLabelRef} aria-hidden="true" className="invisible absolute whitespace-nowrap">
				{truncateBreadcrumbLabel(label, getBreadcrumbLimit())}
			</span>
			<span ref={ellipsisRef} aria-hidden="true" className="invisible absolute whitespace-nowrap">
				…
			</span>
		</span>
	);
};

export const Breadcrumb = ({ links }: { links: BreadcrumbLinkItem[] }) => {
	return (
		<BreadcrumbElements>
			<BreadcrumbList>
				{links.map((link, index) => {
					const isLast = index === links.length - 1;
					const isHome = index === 0;
					const content = isHome ? (
						<>
							<span aria-hidden="true">
								<Home className="h-4 w-4 sm:hidden" />
								<span className="hidden sm:inline">
									<BreadcrumbLabel label={link.label} />
								</span>
							</span>
							<span className="sr-only">{link.label}</span>
						</>
					) : (
						<BreadcrumbLabel label={link.label} />
					);

					return (
						<React.Fragment key={`${link.href}-${link.label}`}>
							<BreadcrumbItem shrink={isLast}>
								{isLast ? (
									<span className="block max-w-full min-w-0 flex-1" title={link.label} aria-label={link.label}>
										{content}
									</span>
								) : (
									<BreadcrumbLink href={link.href} title={link.label} aria-label={link.label}>
										<span className="min-w-0">{content}</span>
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
							{isLast ? null : <BreadcrumbSeparator />}
						</React.Fragment>
					);
				})}
			</BreadcrumbList>
		</BreadcrumbElements>
	);
};
