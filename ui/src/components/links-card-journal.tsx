'use client';
import React, { useState } from 'react';
import { linkCn, Typography, Separator, Button } from '@socialincome/ui';

const placeholderImage = '/assets/metadata/placeholder/news-outlet.svg';

interface ReferencedLink {
	_uid: string;
	source_url: { url: string };
	source_title?: string;
	source_date: string;
	source_author: string;
	source_media_outlet?: string;
	source_thumbnail?: { filename?: string };
}

interface LinksCardJournalProps {
	reference_context: 'no_context' | 'reference_related' | 'reference_original';
	single_link: ReferencedLink[];
}

export function LinksCardJournal({
																	 reference_context,
																	 single_link,
																 }: LinksCardJournalProps) {
	const [showAll, setShowAll] = useState(false);
	const hasMultiple = single_link.length > 1;
	const displayedLinks = showAll ? single_link : single_link.slice(0, 3);

	const formattedDate = (iso: string) =>
		new Date(iso).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});

	const hasAnyThumbnail = single_link.some((link) => !!link.source_thumbnail?.filename);
	const hasMixedThumbnails =
		hasMultiple && hasAnyThumbnail && single_link.some((link) => !link.source_thumbnail?.filename);

	let introText: string | null = null;
	if (reference_context === 'reference_original') {
		introText = 'Originally published as:';
	} else if (reference_context === 'reference_related') {
		introText = hasMultiple
			? 'These articles provided background and insights for this piece:'
			: 'This article provided background and insights for this piece:';
	}

	return (
		<div className="w-full rounded-md p-6 bg-primary bg-opacity-10" >
			{introText && (
				<>
					<Typography size="sm" className="text-foreground p-0 m-0">
						{introText}
					</Typography>
					<Separator className="my-4 bg-foreground opacity-30" />
				</>
			)}

			<div className="flex flex-col gap-1">
				{displayedLinks.map((link, index) => {
					const outletName = link.source_media_outlet ?? 'Unknown Outlet';
					let thumbnail = link.source_thumbnail?.filename;

					if (hasMixedThumbnails && !thumbnail) {
						thumbnail = placeholderImage;
					}

					return (
						<React.Fragment key={link._uid}>
							<div className="flex w-full items-center gap-3 p-0">
								{thumbnail && (
									<a href={link.source_url.url} target="_blank" rel="noopener noreferrer">
										<img
											src={thumbnail}
											alt={outletName}
											className="h-16 w-16 object-contain self-center m-0 mr-4"
										/>
									</a>
								)}

								<div className="flex flex-col leading-tight space-y-1">
									<a
										href={link.source_url.url}
										className={linkCn({
											arrow: 'external',
											size: 'md',
											underline: 'none',
											weight: 'medium',
										}) + ' !font-medium'}
									>
										{link.source_title ?? 'Untitled'}
									</a>
									{thumbnail ? (
										<>
											<Typography size="sm" className="text-foreground">
												{outletName}
											</Typography>
											<Typography size="sm" className="text-foreground">
												by {link.source_author} on {formattedDate(link.source_date)}
											</Typography>
										</>
									) : (
										<Typography size="sm" className="text-foreground">
											{outletName} by {link.source_author} on {formattedDate(link.source_date)}
										</Typography>
									)}
								</div>
							</div>
							{index < displayedLinks.length - 1 && (
								<Separator className="my-4 bg-foreground opacity-30" />
							)}
						</React.Fragment>
					);
				})}
			</div>

			{single_link.length > 3 && (
				<div className="mt-2 pt-2 text-center">
					<Button variant="link" onClick={() => setShowAll(!showAll)}>
						{showAll ? 'Show less' : `See all (${single_link.length})`}
					</Button>
				</div>
			)}
		</div>
	);
}