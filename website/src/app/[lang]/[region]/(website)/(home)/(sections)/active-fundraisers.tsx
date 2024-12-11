import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Typography } from '@socialincome/ui';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ismatuImage from '../(assets)/avatar-ismatu.png';

export async function ActiveFundraisers({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-campaign'],
	});

	return (
		<div className="mx-auto mb-8 mt-12 flex flex-col items-center justify-center space-y-4">
			{/* Badge Temporary */}
			<div className="w-full flex justify-center">
				<div
					className="border-text-popover-foreground-muted text-primary relative flex items-center rounded-full border-2 px-6 py-2 transition-all duration-300"
				>
					{/* Loading Dots Animation */}
					<svg width="48" height="12" viewBox="0 0 48 12" fill="none" xmlns="http://www.w3.org/2000/svg"
							 className="pr-2">
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

					{/* Text Content */}
					<div className="flex flex-col pl-2">
						<Typography size="lg" className="text-popover-foreground-muted">
							Loading fundraisers
						</Typography>
					</div>
				</div>
			</div>

			{/* Fundraiser Cards */}
			<div className="flex flex-wrap justify-center gap-4">
				{[...Array(3)].map((_, index) => (
					<Link
						key={index}
						href={`https://socialincome.org`}
						className={`border-text-popover-foreground-muted hover:bg-primary group relative flex w-[260px] items-center rounded-full border-2 px-6 py-2 transition-all duration-300 hover:w-[280px] hover:text-white hover:border-primary
              ${index === 1 ? 'hidden md:flex' : index === 2 ? 'hidden lg:flex' : ''}`}
					>
						{/* Avatar */}
						<div
							className="-ml-2 mr-2 h-10 w-10 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-125">
							<Image alt="Avatar" src={ismatuImage} width={40} height={40} className="object-cover" />
						</div>

						{/* Text Content */}
						<div className="flex flex-col pl-2">
							{/* Default Text */}
							<div className="w-[150px] text-popover-foreground-muted flex items-center space-x-1 group-hover:hidden">
								<Typography size="lg">{translator.t('badges.by')}</Typography>
								<Typography size="lg" className="truncate overflow-hidden whitespace-nowrap">
									Ismatu Banjura
								</Typography>
							</div>
							<div className="w-[150px] text-primary group-hover:hidden">
								<Typography size="lg" weight="medium" className="truncate overflow-hidden whitespace-nowrap">
									Rebuilding Lives
								</Typography>
							</div>

							{/* Hover Text */}
							<div className="flex items-baseline space-x-2 leading-none">
								<Typography size="lg" className="hidden text-white group-hover:inline">
									USD 43,000
								</Typography>
								<Typography size="sm" className="text-accent hidden group-hover:inline">
									23%
								</Typography>
							</div>
							<div className="text-accent hidden items-center space-x-1 group-hover:flex">
								<Typography size="lg" weight="medium">
									2344
								</Typography>
								<Typography size="lg" weight="medium">
									{translator.t('badges.contributors')}
								</Typography>
							</div>
						</div>

						{/* Chevron Circle */}
						<div
							className="absolute right-3 hidden h-8 w-8 items-center justify-center rounded-full bg-white group-hover:flex">
							<ChevronRight className="text-primary" />
						</div>
					</Link>
				))}
			</div>

			{/* See All Fundraisers Link */}
			<div className="mt-6">
				<Link href={`/${lang}/fundraisers`} className="text-primary hover:underline">
					See all X fundraisers
				</Link>
			</div>
		</div>
	)
}

