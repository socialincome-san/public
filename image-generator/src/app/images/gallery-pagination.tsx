'use client';

import { Button } from '@socialincome/design-system/actions/button/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@socialincome/design-system/forms/select/select';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export const GalleryPagination = ({ page, pageSize, hasNextPage }: { page: number; pageSize: number; hasNextPage: boolean }) => {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const navigate = (nextPage: number, size = pageSize) => {
		startTransition(() => router.push(`/images?page=${nextPage}&size=${size}`, { scroll: false }));
	};

	return (
		<div className="mt-8 flex flex-wrap items-center justify-between gap-4" aria-busy={isPending}>
			<div className="flex items-center gap-3">
				<span className="text-muted-foreground text-sm">Bilder pro Seite</span>
				<div className="w-24">
					<Select value={String(pageSize)} onValueChange={(value) => navigate(1, Number(value))} disabled={isPending}>
						<SelectTrigger aria-label="Bilder pro Seite"><SelectValue /></SelectTrigger>
						<SelectContent>
							{[12, 24, 36].map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}
						</SelectContent>
					</Select>
				</div>
			</div>
			<div className="flex items-center gap-3">
				<Button variant="outline" size="sm" disabled={page === 1 || isPending} onClick={() => navigate(page - 1)}>Zurück</Button>
				<span className="text-muted-foreground text-sm">Seite {page}</span>
				<Button size="sm" disabled={!hasNextPage || isPending} onClick={() => navigate(page + 1)}>
					{isPending ? 'Lädt …' : 'Weitere Bilder'}
				</Button>
			</div>
		</div>
	);
};
