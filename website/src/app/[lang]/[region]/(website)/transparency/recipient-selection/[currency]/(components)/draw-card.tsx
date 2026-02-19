'use client';

import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Card, Collapsible, CollapsibleContent, CollapsibleTrigger, Typography } from '@socialincome/ui';
import { DateTime } from 'luxon';
import Link from 'next/link';
import { CompletedDraw } from '../(sections)/state';

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

export const DrawCard = ({ draw, translations }: DrawCardProps) => {
	return (
		<Collapsible>
			<CollapsibleTrigger asChild>
				<Card className="cursor-pointer p-4 duration-100 hover:scale-[101%] md:p-8">
					<div className="grid grid-cols-2 items-center gap-2 md:grid-cols-3">
						<Typography className="col-span-1">{DateTime.fromMillis(draw.time).toFormat('dd/MM/yyyy')}</Typography>
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
									<Link
										href={`https://api.drand.sh/52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971/public/${draw.drandRound}`}
										target="_blank"
										rel="noopener noreferrer"
										className="underline"
									>
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
										rel="noopener noreferrer"
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
