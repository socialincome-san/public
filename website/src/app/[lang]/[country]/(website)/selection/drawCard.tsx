'use client';
import { FutureDraw, PastDraw } from '@/app/[lang]/[country]/(website)/selection/state';
import { Disclosure } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Typography } from '@socialincome/ui';
import * as React from 'react';

export interface DrawCardsProps {
	summary: React.ReactNode;
	detail?: React.ReactNode;
}

// a collapsible element rendering the summary, and optionally a button to open the detailed view
export function DrawCard(props: DrawCardsProps) {
	return (
		<Disclosure>
			<div className="m-4 bg-gray-200 p-2 shadow-xl">
				<div className="flex h-20 h-full w-full flex-row items-center">
					<div className="grow">{props.summary}</div>
					<div>
						{!!props.detail ? (
							<Disclosure.Button>
								<ChevronDownIcon height="2em"></ChevronDownIcon>
							</Disclosure.Button>
						) : (
							/* this is a filthy hack for spacing, but is actually responsive by some sorcery */
							<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
						)}
					</div>
				</div>
				{!!props.detail && <Disclosure.Panel>{props.detail}</Disclosure.Panel>}
			</div>
		</Disclosure>
	);
}

export type DrawSummaryProps = {
	translations: {
		from: string;
	};
	draw: PastDraw | FutureDraw;
	translator?: Translator;
};

export function DrawSummary({ draw, translations }: DrawSummaryProps) {
	return (
		<div className="flex h-full w-full flex-row items-center">
			<div className="basis-1/4">{new Date(draw.time).toLocaleDateString()}</div>
			<div className="grow">{draw.name}</div>
			<div className="basis-1/4">
				{draw.count} {translations.from} {draw.total}
			</div>
		</div>
	);
}

export type DrawDetailProps = {
	translations: {
		randomNumber: string;
		longlist: string;
		people: string;
		confirmDrand: string;
		confirmGithub: string;
	};
	draw: PastDraw;
};

export function DrawDetail({ draw, translations }: DrawDetailProps) {
	return (
		<div>
			<div className="flex justify-between p-2">
				<div>
					<Typography weight="bold">{translations.randomNumber}:</Typography>
					<Typography>{draw.drandRandomness}</Typography>
				</div>
				<div>
					<a className="underline" href={`https://api.drand.sh/public/${draw.drandRound}`}>
						{translations.confirmDrand}
					</a>
				</div>
			</div>
			<div className="flex justify-between p-2">
				<div>
					<Typography weight="bold">{translations.people}:</Typography>
					<Typography>{translations.longlist}</Typography>
				</div>
				<div>
					<a className="underline" href={`https://github.com/socialincome-san/public/tree/main/lists${draw.name}`}>
						{translations.confirmGithub}
					</a>
				</div>
			</div>
		</div>
	);
}
