'use client';

import { CompletedDraw } from '@/app/[lang]/[region]/(website)/transparency/random-selection/(sections)/state';
import { WebsiteLanguage } from '@/i18n';
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
		<Collapsible onOpenChange={(open) => setOpen(open)}>
			<CollapsibleTrigger asChild>
				<Card className="border-primary cursor-pointer border-2 bg-transparent p-4 shadow-none duration-200 hover:scale-[101%] md:p-8">
					<div className="grid grid-cols-2 items-center gap-2 md:grid-cols-3">
						<Typography className="col-span-1">
							{new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(draw.time)}
						</Typography>
						<Typography className="col-span-1 text-right md:text-left">NGO {draw.name}</Typography>
						<div className="col-span-2 text-right md:col-span-1">
							<Typography className="truncate">{translations.summary}</Typography>
						</div>
					</div>
					<CollapsibleContent className="py-4 md:pt-8">
						<div className="space-y-4">
							<div className="grid grid-cols-3 items-center gap-4">
								<div className="col-span-2">
									<Typography weight="medium">{translations.randomNumber}</Typography>
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
									<Typography weight="medium">{translations.people}</Typography>
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
				</Card>
			</CollapsibleTrigger>
		</Collapsible>
	);
}
