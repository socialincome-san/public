'use client';

import { DefaultPageProps } from '@/app/[lang]/[region]';
import { getMetadata } from '@/metadata';
import { Button, Card, Dialog, DialogContent, DialogTitle, DialogTrigger, linkCn, Typography } from '@socialincome/ui';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

export async function generateMetadata(props: DefaultPageProps) {
	const params = await props.params;
	return getMetadata(params.lang, 'website-newsletter');
}

type Newsletter = {
	slug: string;
	title: string;
	date: string; // already formatted "May 1, 2024"
};

type Props = {
	newsletters: Newsletter[]; // newest-first (as returned by getAllNewsletters)
};

export function NewsletterListClient({ newsletters }: Props) {
	// null = dialog closed; otherwise stores the slug of the open newsletter
	const [openSlug, setOpenSlug] = useState<string | null>(null);

	// Build index <-> slug maps once (best practice: O(1) lookups)
	const { indexBySlug, ordered } = useMemo(() => {
		const map = new Map<string, number>();
		newsletters.forEach((n, i) => map.set(n.slug, i));
		return { indexBySlug: map, ordered: newsletters };
	}, [newsletters]);

	const currentIndex = openSlug != null ? (indexBySlug.get(openSlug) ?? -1) : -1;
	const current = currentIndex >= 0 ? ordered[currentIndex] : null;

	// Chronological nav:
	// - list is newest-first
	// - "Previous" goes to OLDER (index + 1)
	// - "Next" goes to NEWER (index - 1)
	const canGoPrev = currentIndex >= 0 && currentIndex < ordered.length - 1;
	const canGoNext = currentIndex > 0;

	const goPrev = useCallback(() => {
		if (canGoPrev) setOpenSlug(ordered[currentIndex + 1].slug);
	}, [canGoPrev, ordered, currentIndex]);

	const goNext = useCallback(() => {
		if (canGoNext) setOpenSlug(ordered[currentIndex - 1].slug);
	}, [canGoNext, ordered, currentIndex]);

	// Keyboard navigation when dialog is open
	useEffect(() => {
		if (!openSlug) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				goPrev();
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				goNext();
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [openSlug, goPrev, goNext]);

	return (
		<div className="space-y-3 md:space-y-4">
			{ordered.map(({ slug, title, date }) => (
				<Dialog key={slug} open={openSlug === slug} onOpenChange={(isOpen) => setOpenSlug(isOpen ? slug : null)}>
					{/* Make the whole card the trigger */}
					<DialogTrigger asChild>
						<Card
							className="bg-background hover:bg-primary cursor-pointer rounded-lg border-2 border-opacity-80 px-2 py-5 shadow-none transition hover:bg-opacity-10 md:px-5 md:py-5"
							role="button"
							tabIndex={0}
						>
							<div className="flex items-center justify-between gap-4">
								<div className="min-w-0">
									<Typography size="lg" weight="medium" className="truncate">
										{title}
									</Typography>
									<Typography size="md" className="text-muted-foreground">
										{date}
									</Typography>
								</div>
							</div>
						</Card>
					</DialogTrigger>

					{/* Keep these sizing constraints as requested */}
					<DialogContent className="m-0 h-[85vh] max-w-3xl overflow-y-auto p-0">
						<DialogTitle className="sr-only">Newsletter Preview</DialogTitle>

						{/* Scroll container: iframe plus sticky footer */}
						<div className="flex min-h-full flex-col">
							{/* Iframe takes remaining height (85 vh minus footer height 56px = 14 * 4px) */}
							<iframe
								key={slug /* force reload when switching items */}
								src={openSlug ? `/api/newsletter/${openSlug}` : 'about:blank'}
								title={current?.title ?? 'Newsletter'}
								className="block w-full border-none"
								style={{ height: 'calc(85vh - 56px)' }}
							/>

							{/* Sticky footer */}
							<div className="bg-background/95 supports-[backdrop-filter]:bg-background/75 sticky bottom-0 z-10 h-14 border-t backdrop-blur">
								<div className="mx-2 flex h-full items-center justify-between gap-2">
									<Button
										variant="outline"
										onClick={goPrev}
										disabled={!canGoPrev}
										aria-label="Previous newsletter (older)"
									>
										Previous
									</Button>

									<Link
										href={`/en/int/newsletter/archive/${current?.slug ?? slug}`}
										className={linkCn({ arrow: 'external', underline: 'none' })}
									>
										{current?.date ?? date}
									</Link>

									<Button variant="outline" onClick={goNext} disabled={!canGoNext} aria-label="Next newsletter (newer)">
										Next
									</Button>
								</div>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			))}
		</div>
	);
}
