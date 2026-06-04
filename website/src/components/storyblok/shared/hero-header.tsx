import { DonationForm } from '@/components/donation-wizard/donation-form';
import NextImage from 'next/image';
import type { ReactNode } from 'react';

type HeroHeaderStat = {
	value?: number;
	label: string;
};

type Props = {
	title: string;
	heroImageFilename?: string | null;
	heroImageAlt?: string | null;
	stats: HeroHeaderStat[];
	titleIcon?: string;
	titleIconAlt?: string;
	preTitle?: ReactNode;
	badges?: ReactNode;
};

export const HeroHeader = ({
	title,
	heroImageFilename,
	heroImageAlt,
	stats,
	titleIcon,
	titleIconAlt,
	preTitle,
	badges,
}: Props) => {
	return (
		<section className="full-bleed-hero flex flex-col gap-6">
			<div className="relative aspect-video max-h-[80vh] min-h-112 w-full overflow-hidden rounded-b-3xl bg-black md:min-h-160 md:rounded-b-[56px]">
				{heroImageFilename ? (
					<NextImage
						src={heroImageFilename}
						alt={heroImageAlt ?? title}
						fill
						sizes="100vw"
						className="object-cover"
						priority
					/>
				) : (
					<div className="bg-primary/20 absolute inset-0" />
				)}

				<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/15" />

				<div className="max-w-content 2xl:w-site-width absolute inset-0 z-20 ml-[2vw] flex flex-row items-end justify-between gap-4 pr-24 pb-24 pl-8 text-white 2xl:mx-auto 2xl:pr-0">
					<div className="flex max-w-2xl flex-col gap-4 text-white">
						{preTitle ? <div className="flex flex-wrap gap-2">{preTitle}</div> : null}
						<div className="flex items-center gap-4">
							{titleIcon ? (
								<NextImage
									src={titleIcon}
									alt={titleIconAlt ?? title}
									width={44}
									height={32}
									className="h-8 w-11 rounded-sm"
								/>
							) : null}
							<h1 className="text-4xl font-bold xl:text-6xl">{title}</h1>
						</div>

						{stats.length > 0 ? (
							<div className="flex flex-wrap gap-2">
								{stats.map((stat) => (
									<span
										key={stat.label}
										className="inline-flex items-center justify-center rounded-full border border-white/50 bg-black/40 px-3 py-1 text-xs leading-none font-medium text-white"
									>
										{stat.value !== undefined ? `${stat.value} ` : ''}
										{stat.label}
									</span>
								))}
							</div>
						) : null}

						{badges ? <div className="flex flex-wrap gap-2">{badges}</div> : null}
					</div>

					<div className="hidden shrink-0 lg:block">
						<DonationForm />
					</div>
				</div>
			</div>

			<div className="flex justify-center lg:hidden">
				<DonationForm />
			</div>
		</section>
	);
};
