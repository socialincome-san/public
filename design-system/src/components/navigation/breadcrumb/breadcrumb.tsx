'use client';

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

const DESKTOP_QUERY = '(min-width: 64rem)';

const subscribeToDesktop = (onChange: () => void) => {
	const query = window.matchMedia(DESKTOP_QUERY);
	query.addEventListener('change', onChange);

	return () => query.removeEventListener('change', onChange);
};

const BreadcrumbLabel = ({ label }: { label: string }) => {
	const labelRef = React.useRef<HTMLSpanElement>(null);
	const fullLabelRef = React.useRef<HTMLSpanElement>(null);
	const truncatedLabelRef = React.useRef<HTMLSpanElement>(null);
	const ellipsisRef = React.useRef<HTMLSpanElement>(null);
	const isDesktop = React.useSyncExternalStore(
		subscribeToDesktop,
		() => window.matchMedia(DESKTOP_QUERY).matches,
		() => false,
	);
	const truncatedLabel = truncateBreadcrumbLabel(label, isDesktop ? 20 : 12);
	const [fit, setFit] = React.useState<{ candidate: string; label: string } | null>(null);
	const isFitted = fit?.candidate === truncatedLabel;
	const displayLabel = isFitted ? fit.label : label;

	React.useLayoutEffect(() => {
		const element = labelRef.current;
		if (isFitted || !element) {
			return;
		}

		// The current item does not shrink, so it can overflow the list instead of getting narrower.
		const list = element.closest('ol');
		const available = element.clientWidth - (list ? list.scrollWidth - list.clientWidth : 0);
		const fits = (candidate: HTMLSpanElement | null) => candidate !== null && candidate.offsetWidth <= available;

		setFit({
			candidate: truncatedLabel,
			label: fits(fullLabelRef.current)
				? label
				: fits(truncatedLabelRef.current)
					? truncatedLabel
					: fits(ellipsisRef.current)
						? '…'
						: '',
		});
	}, [isFitted, label, truncatedLabel]);

	// The label is as wide as its text, so it can only tell whether a candidate fits while showing the full label.
	React.useLayoutEffect(() => {
		const list = labelRef.current?.closest('ol');
		if (!list) {
			return;
		}

		const observer = new ResizeObserver(() => setFit(null));
		observer.observe(list);

		return () => observer.disconnect();
	}, []);

	return (
		<span ref={labelRef} className="relative block min-w-0 overflow-hidden whitespace-nowrap">
			<span aria-hidden="true">{displayLabel}</span>
			<span className="sr-only">{label}</span>
			<span ref={fullLabelRef} aria-hidden="true" className="invisible absolute whitespace-nowrap">
				{label}
			</span>
			<span ref={truncatedLabelRef} aria-hidden="true" className="invisible absolute whitespace-nowrap">
				{truncatedLabel}
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
							<BreadcrumbItem current={isLast}>
								{isLast ? (
									<span className="block min-w-0" title={link.label}>
										{content}
									</span>
								) : (
									<BreadcrumbLink href={link.href} title={link.label} aria-label={link.label}>
										{content}
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
