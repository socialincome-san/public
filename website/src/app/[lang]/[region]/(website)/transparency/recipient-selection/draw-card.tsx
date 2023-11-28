'use client';

import { CompletedDraw } from '@/app/[lang]/[region]/(website)/transparency/recipient-selection/state';
import { WebsiteLanguage } from '@/i18n';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { Card, Collapsible, CollapsibleContent, CollapsibleTrigger, Typography } from '@socialincome/ui';
import Link from 'next/link';
import { useState } from 'react';

type DrawCardProps = {
	lang: WebsiteLanguage;
	draw: CompletedDraw;
	translations: {
		randomNumber: string;
		confirmDrand: string;
		people: string;
		longlist: string;
		confirmGithub: string;
		summary: string;
	};
};

export function DrawCard({ lang, draw, translations }: DrawCardProps) {
	const [open, setOpen] = useState(false);

	return (
		<Card className="p-8">
			<Collapsible onOpenChange={(open) => setOpen(open)}>
				<CollapsibleTrigger asChild>
					<div className="grid cursor-pointer grid-cols-1 gap-2 md:grid-cols-4">
						<Typography>{new Intl.DateTimeFormat(lang).format(draw.time)}</Typography>
						<Typography>{draw.name}</Typography>
						<Typography className="truncate">{translations.summary}</Typography>
						{open ? (
							<ChevronUpIcon className="h-4 w-4 justify-self-end" />
						) : (
							<ChevronDownIcon className="h-4 w-4 justify-self-end" />
						)}
					</div>
				</CollapsibleTrigger>
				<CollapsibleContent className="py-8">
					<div className="space-y-4">
						<div className="grid grid-cols-3 items-center gap-4">
							<div className="col-span-2">
								<Typography weight="bold">{translations.randomNumber}:</Typography>
								<Typography className="break-all">{draw.drandRandomness}</Typography>
							</div>
							<div className="justify-self-end">
								<Link href={`https://api.drand.sh/public/${draw.drandRound}`} target="_blank" className="underline">
									{translations.confirmDrand}
								</Link>
							</div>
						</div>
						<div className="grid grid-cols-3 items-center gap-4">
							<div className="col-span-2">
								<Typography weight="bold">{translations.people}:</Typography>
								<Typography>{translations.longlist}</Typography>
							</div>
							<div className="justify-self-end">
								<Link
									href={`https://github.com/socialincome-san/public/blob/main/recipients_selection/lists/${draw.filename}`}
									target="_blank"
									className="underline"
								>
									{translations.confirmGithub}
								</Link>
							</div>
						</div>
					</div>
				</CollapsibleContent>
			</Collapsible>
		</Card>
	);
}
