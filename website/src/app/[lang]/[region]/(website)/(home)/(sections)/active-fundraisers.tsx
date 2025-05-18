'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { Typography } from '@socialincome/ui';
import classNames from 'classnames';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useIntersectionObserver } from 'usehooks-ts';
import ismatuImage from '../(assets)/avatar-ismatu.png';

type DefaultPageProps = {
	campaignProps: {
		id: string;
		creatorName: string;
		title: string;
		contributorCount: number;
		goalCurrency: string;
		amountCollected: number;
		percentageCollected?: number;
	}[];
	translations: {
		by: string;
		contributors: string;
		loading: string;
	};
} & DefaultParams;

export function ActiveFundraisers({ lang, campaignProps, translations }: DefaultPageProps) {
	const [showFundraiserCards, setShowFundraiserCards] = useState(false);

	const { ref, isIntersecting, entry } = useIntersectionObserver({ threshold: 0.2 });

	useEffect(() => {
		// Show fundraiser cards with .5-second delay when the element is in view
		if (isIntersecting) {
			setTimeout(() => {
				setShowFundraiserCards(true);
			}, 500);
		}
	}, [isIntersecting, entry?.boundingClientRect.bottom, entry?.boundingClientRect.top]);

	return (
		<div ref={ref} className="mx-auto mb-8 mt-12 flex flex-col items-center justify-center space-y-4">
			{!showFundraiserCards && (
				<div className="flex w-full justify-center">
					<div className="border-text-popover-foreground-muted text-primary relative flex items-center rounded-full border-2 px-6 py-2 transition-all duration-300">
						<svg
							width="48"
							height="12"
							viewBox="0 0 48 12"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							className="pr-2"
						>
							<circle cx="6" cy="6" r="6" fill="currentColor">
								<animate
									attributeName="opacity"
									values="0.3;1;0.3"
									keyTimes="0;0.5;1"
									dur="1.5s"
									begin="0s"
									repeatCount="indefinite"
								/>
							</circle>
							<circle cx="24" cy="6" r="6" fill="currentColor">
								<animate
									attributeName="opacity"
									values="0.3;1;0.3"
									keyTimes="0;0.5;1"
									dur="1.5s"
									begin="0.3s"
									repeatCount="indefinite"
								/>
							</circle>
							<circle cx="42" cy="6" r="6" fill="currentColor">
								<animate
									attributeName="opacity"
									values="0.3;1;0.3"
									keyTimes="0;0.5;1"
									dur="1.5s"
									begin="0.6s"
									repeatCount="indefinite"
								/>
							</circle>
						</svg>
						<div className="flex flex-col pl-2">
							<Typography size="lg" className="text-popover-foreground-muted">
								{translations.loading}
							</Typography>
						</div>
					</div>
				</div>
			)}

			{showFundraiserCards && (
				<div className="flex flex-wrap justify-center gap-4">
					{campaignProps.map((campaignData, index) => (
						<Link
							key={campaignData.id}
							href={`/${lang}/campaign/${campaignData.id}`}
							className={classNames(
								'border-text-popover-foreground-muted hover:bg-primary hover:border-primary group relative flex w-[260px] items-center rounded-full border-2 px-6 py-2 transition-all duration-300 hover:w-[280px] hover:text-white',
								{
									'hidden md:flex': index === 1,
									'hidden lg:flex': index === 2,
								},
							)}
						>
							<div className="-ml-2 mr-2 h-10 w-10 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-125">
								{/* The image is currently hardcoded to our long-running campaign. It should eventually use the campaign-specific image, which needs to be added to the campaign data model first. */}
								<Image alt="Avatar" src={ismatuImage} width={40} height={40} className="object-cover" />
							</div>
							<div className="flex flex-col pl-2">
								<div className="text-popover-foreground-muted flex w-[150px] items-center space-x-1 group-hover:hidden">
									<Typography size="lg">{translations.by}</Typography>
									<Typography size="lg" className="overflow-hidden truncate whitespace-nowrap">
										{campaignData.creatorName}
									</Typography>
								</div>
								<div className="text-primary w-[150px] group-hover:hidden">
									<Typography size="lg" weight="medium" className="overflow-hidden truncate whitespace-nowrap">
										{campaignData.title}
									</Typography>
								</div>
								<div className="flex items-baseline space-x-2 leading-none">
									<Typography size="lg" className="hidden text-white group-hover:inline">
										{campaignData.goalCurrency} {campaignData.amountCollected || 0}
									</Typography>
									<Typography size="sm" className="text-accent hidden group-hover:inline">
										{campaignData.percentageCollected ? `${campaignData.percentageCollected}%` : ''}
									</Typography>
								</div>
								<div className="text-accent hidden items-center space-x-1 group-hover:flex">
									<Typography size="lg" weight="medium">
										{campaignData.contributorCount}
									</Typography>
									<Typography size="lg" weight="medium">
										{translations.contributors}
									</Typography>
								</div>
							</div>
							<div className="absolute right-3 hidden h-8 w-8 items-center justify-center rounded-full bg-white group-hover:flex">
								<ChevronRight className="text-primary" />
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
