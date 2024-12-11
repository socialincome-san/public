import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ismatuImage from '../(assets)/avatar-ismatu.png';

export async function ActiveFundraisers({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home'],
	});

	return (
		<BaseContainer className="mx-auto mb-8 mt-12 flex items-center justify-center">
			<Link
				href={`/${lang}/fundraisers`}
				className="border-text-popover-foreground-muted hover:bg-primary group relative mt-4 flex w-[260px] items-center rounded-full border-2 px-6 py-2 transition-all duration-300 hover:w-[300px] hover:text-white"
			>
				{/* Avatar */}
				<div className="-ml-2 mr-2 h-10 w-10 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-125">
					<Image alt="Avatar" src={ismatuImage} width={40} height={40} className="object-cover" />
				</div>

				{/* Text Content */}
				<div className="flex flex-col pl-2">
					{/* Default Text */}
					<Typography size="lg" className="text-popover-foreground-muted group-hover:hidden">
						By Ismatu Banjura
					</Typography>
					<Typography size="lg" weight="medium" className="text-primary group-hover:hidden">
						Rebuilding Lives
					</Typography>

					{/* Hover Text */}
					<div className="flex items-baseline space-x-2 leading-none">
						<Typography size="lg" className="hidden text-white group-hover:inline">
							USD 43,000
						</Typography>
						<Typography size="sm" className="text-accent hidden group-hover:inline">
							23%
						</Typography>
					</div>
					<Typography size="lg" weight="medium" className="text-accent hidden group-hover:inline">
						2344 contributors
					</Typography>
				</div>

				{/* Chevron Circle */}
				<div className="absolute right-4 hidden h-8 w-8 items-center justify-center rounded-full bg-white group-hover:flex">
					<ChevronRight className="text-primary" />
				</div>
			</Link>
			<Link
				href={`/${lang}/fundraisers`}
				className="border-text-popover-foreground-muted text-primary relative mt-4 flex items-center rounded-full border-2 px-6 py-2 transition-all duration-300"
			>
				{/* Loading Dots Animation */}
				<svg width="48" height="12" viewBox="0 0 48 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="pr-2">
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
					{/* Default Text */}
					<Typography size="lg" className="text-popover-foreground-muted">
						Loading fundraisers
					</Typography>
				</div>
			</Link>
		</BaseContainer>
	);
}
