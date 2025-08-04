'use client';

import { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, Typography } from '@socialincome/ui';

type Props = {
	newsletters: {
		slug: string;
		title: string;
		date: string;
	}[];
};

export function NewsletterListClient({ newsletters }: Props) {
	const [openSlug, setOpenSlug] = useState<string | null>(null);

	return (
		<ul className="space-y-6">
			{newsletters.map(({ slug, title, date }) => (
				<li key={slug} className="border-b pb-4">
					<div className="flex justify-between items-center">
						<div>
							<Typography size="lg" weight="medium">
								{title}
							</Typography>
							<Typography size="sm" className="text-muted-foreground">
								{date}
							</Typography>
						</div>
						<Dialog>
							<DialogTrigger asChild>
								<button
									onClick={() => setOpenSlug(slug)}
									className="text-sm text-blue-600 underline"
								>
									Open ↗
								</button>
							</DialogTrigger>
							<DialogContent className="!p-0 !m-0 rounded-xl max-w-3xl h-[85vh] overflow-hidden [&>*]:!m-0">
								<DialogTitle className="sr-only">Newsletter Preview</DialogTitle>
								{openSlug === slug && (
									<iframe
										src={`/api/newsletter/${slug}`}
										className="w-full h-full border-none"
									/>
								)}
							</DialogContent>
						</Dialog>
					</div>
				</li>
			))}
		</ul>
	);
}