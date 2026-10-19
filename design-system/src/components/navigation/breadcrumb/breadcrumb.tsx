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
	const trimmedLabel = label.trim();
	if (trimmedLabel.length <= limit) {
		return trimmedLabel;
	}

	const words = trimmedLabel.split(/\s+/);
	const normalizedLabel = words.join(' ');
	if (words.length === 1) {
		return `${trimmedLabel.slice(0, limit)}…`;
	}

	let truncated = '';
	let position = 0;
	for (const [index, word] of words.entries()) {
		const wordStart = position;
		const wordEnd = wordStart + word.length;
		if (wordStart >= limit) {
			return `${truncated}…`;
		}

		truncated = truncated ? `${truncated} ${word}` : word;
		position = wordEnd + 1;

		if (wordEnd > limit) {
			if (wordStart === 0) {
				return `${word.slice(0, limit)}…`;
			}

			if (index === 1) {
				return index === words.length - 1 ? normalizedLabel : `${truncated}…`;
			}

			return `${truncated.slice(0, truncated.lastIndexOf(' '))}…`;
		}
	}

	return truncated ? normalizedLabel : `${trimmedLabel.slice(0, limit)}…`;
};

const DESKTOP_QUERY = '(min-width: 64rem)';

const subscribeToDesktop = (onChange: () => void) => {
	const query = window.matchMedia(DESKTOP_QUERY);
	query.addEventListener('change', onChange);

	return () => query.removeEventListener('change', onChange);
};

type BreadcrumbMeasurement = {
	element: HTMLSpanElement;
	reset: () => void;
};

const BreadcrumbMeasurementContext = React.createContext<{
	register: (measurement: BreadcrumbMeasurement) => () => void;
} | null>(null);

const BreadcrumbLabel = ({ label }: { label: string }) => {
	const measurementContext = React.useContext(BreadcrumbMeasurementContext);
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
	const [fit, setFit] = React.useState<{ candidate: string; source: string; label: string } | null>(null);
	const isFitted = fit?.candidate === truncatedLabel && fit.source === label;
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
			source: label,
			label: fits(fullLabelRef.current) ? label : fits(truncatedLabelRef.current) ? truncatedLabel : '…',
		});
	}, [isFitted, label, truncatedLabel]);

	React.useLayoutEffect(() => {
		if (
			!measurementContext ||
			!labelRef.current ||
			!fullLabelRef.current ||
			!truncatedLabelRef.current ||
			!ellipsisRef.current
		) {
			return;
		}

		return measurementContext.register({
			element: labelRef.current,
			reset: () => setFit(null),
		});
	}, [measurementContext]);

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
	const listRef = React.useRef<HTMLOListElement>(null);
	const measurementsRef = React.useRef(new Set<BreadcrumbMeasurement>());
	const resizeObserverRef = React.useRef<ResizeObserver | null>(null);
	const measurementContext = React.useMemo(
		() => ({
			register: (measurement: BreadcrumbMeasurement) => {
				measurementsRef.current.add(measurement);
				resizeObserverRef.current?.observe(measurement.element);

				return () => {
					measurementsRef.current.delete(measurement);
					resizeObserverRef.current?.unobserve(measurement.element);
				};
			},
		}),
		[],
	);

	React.useEffect(() => {
		const list = listRef.current;
		if (!list || typeof ResizeObserver === 'undefined') {
			return;
		}

		const observer = new ResizeObserver(() => {
			measurementsRef.current.forEach(({ reset }) => reset());
		});
		resizeObserverRef.current = observer;
		observer.observe(list);
		measurementsRef.current.forEach(({ element }) => observer.observe(element));

		return () => {
			observer.disconnect();
			resizeObserverRef.current = null;
		};
	}, []);

	return (
		<BreadcrumbElements>
			<BreadcrumbMeasurementContext.Provider value={measurementContext}>
				<BreadcrumbList ref={listRef}>
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
								<BreadcrumbItem current={isLast} home={isHome}>
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
			</BreadcrumbMeasurementContext.Provider>
		</BreadcrumbElements>
	);
};
