'use client';
import {FutureDraw, PastDraw} from '@/app/[lang]/[region]/(website)/transparency/recipient-selection/state';
import {Disclosure} from '@headlessui/react';
import {ChevronDownIcon, ChevronUpIcon} from '@heroicons/react/20/solid';
import {Translator} from '@socialincome/shared/src/utils/i18n';
import {Card, Typography} from '@socialincome/ui';
import * as React from 'react';

export interface DrawCardsProps {
    summary: React.ReactNode;
    detail?: React.ReactNode;
}

// a collapsible element rendering the summary, and optionally a button to open the detailed view
export function DrawCard(props: DrawCardsProps) {
    return (
        <Disclosure>
            {({open}) => (
                <Card className="m-4 rounded-md border border-gray-500 p-10">
                    <div className="flex h-full w-full flex-row items-center">
                        <div className="grow">{props.summary}</div>
                        <div>
                            {!!props.detail ? (
                                <Disclosure.Button>
                                    {open ? (
                                        <ChevronUpIcon height="2em"></ChevronUpIcon>
                                    ) : (
                                        <ChevronDownIcon height="2em"></ChevronDownIcon>
                                    )}
                                </Disclosure.Button>
                            ) : (
                                /* this is a filthy hack for spacing, but is actually responsive by some sorcery */
                                <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                            )}
                        </div>
                    </div>
                    {!!props.detail && <Disclosure.Panel>{props.detail}</Disclosure.Panel>}
                </Card>
            )}
        </Disclosure>
    );
}

// this details the fields that are in each draw's card
export function DrawHeader() {
    return (
        <div className="flex h-full w-full flex-row items-center px-10">
            <div className="basis-1/4">
                <Typography as="p" size="lg" suppressHydrationWarning>
                    Date
                </Typography>
            </div>
            <div className="grow">
                <Typography as="p" size="lg">
                    Draw name
                </Typography>
            </div>
            <div className="basis-1/4">
                <Typography as="p" size="lg">
                    Details
                </Typography>
            </div>
        </div>
    )
}

export type DrawSummaryProps = {
    translations: {
        from: string;
    };
    draw: PastDraw | FutureDraw;
    translator?: Translator;
};

export function DrawSummary({draw, translations}: DrawSummaryProps) {
    return (
        <div className="flex h-full w-full flex-row items-center">
            <div className="basis-1/4">
                <Typography as="p" size="lg" suppressHydrationWarning>
                    {new Date(draw.time).toDateString()}
                </Typography>
            </div>
            <div className="grow">
                <Typography as="p" size="lg">
                    {draw.name}
                </Typography>
            </div>
            <div className="basis-1/4">
                <Typography as="p" size="lg">
                    {draw.count} {translations.from} {draw.total}
                </Typography>
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

export function DrawDetail({draw, translations}: DrawDetailProps) {
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
                    <a className="underline"
                       href={`https://github.com/socialincome-san/public/blob/main/recipients_selection/lists/${draw.filename}`}>
                        {translations.confirmGithub}
                    </a>
                </div>
            </div>
        </div>
    );
}
