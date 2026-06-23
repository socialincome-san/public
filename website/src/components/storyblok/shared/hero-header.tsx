import { DonationFormServer } from '@/components/donation-wizard/donation-form-server';
import type { StoryblokAsset } from '@/generated/storyblok/types/storyblok';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { formatStoryblokUrl } from '@/lib/services/storyblok/storyblok.utils';
import NextImage from 'next/image';
import type { ReactNode } from 'react';

const HERO_HEADER_IMAGE_WIDTH = 1920;
const HERO_HEADER_IMAGE_HEIGHT = 1080;

type HeroHeaderStat = {
	value?: number;
	label: string;
};

export type HeroHeaderImage = Pick<StoryblokAsset, 'filename' | 'alt' | 'focus'>;

type Props = {
	lang: WebsiteLanguage;
	title: string;
	heroImage?: HeroHeaderImage | null;
	stats: HeroHeaderStat[];
	titleIcon?: string;
	titleIconAlt?: string;
	preTitle?: ReactNode;
	badges?: ReactNode;
	showDonationForm?: boolean;
};

export const HeroHeader = ({
	lang,
	title,
	heroImage,
	stats,
	titleIcon,
	titleIconAlt,
	preTitle,
	badges,
	showDonationForm = true,
}: Props) => {
	const heroImageSrc = heroImage?.filename
		? formatStoryblokUrl(heroImage.filename, HERO_HEADER_IMAGE_WIDTH, HERO_HEADER_IMAGE_HEIGHT, heroImage.focus)
		: null;
	const heroImageAlt = heroImage?.alt ?? title;

	return (
		<section className="full-bleed-hero flex flex-col gap-6">
			<div className="bg-foreground relative aspect-video max-h-[80vh] min-h-112 w-full overflow-hidden rounded-b-3xl md:min-h-160 md:rounded-b-[56px]">
				{heroImageSrc ? (
					<NextImage src={heroImageSrc} alt={heroImageAlt} fill sizes="100vw" className="object-cover" priority />
				) : (
					<div className="bg-primary/20 absolute inset-0" />
				)}

				<div className="from-foreground/70 via-foreground/35 to-foreground/15 absolute inset-0 bg-gradient-to-t" />

				<div className="text-primary-foreground max-w-content 2xl:w-site-width absolute inset-0 z-20 ml-[2vw] flex flex-row items-end justify-between gap-4 pr-24 pb-24 pl-8 2xl:mx-auto 2xl:pr-0">
					<div className="text-primary-foreground flex max-w-2xl flex-col gap-4">
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
										className="text-primary-foreground border-primary-foreground/50 bg-foreground/40 inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs leading-none font-medium"
									>
										{stat.value !== undefined ? `${stat.value} ` : ''}
										{stat.label}
									</span>
								))}
							</div>
						) : null}

						{badges ? <div className="flex flex-wrap gap-2">{badges}</div> : null}
					</div>

					{showDonationForm ? (
						<div className="hidden shrink-0 lg:block">
							<DonationFormServer lang={lang} />
						</div>
					) : null}
				</div>
			</div>

			{showDonationForm ? (
				<div className="w-site-width max-w-content mx-auto w-full px-4 lg:hidden">
					<DonationFormServer lang={lang} />
				</div>
			) : null}
		</section>
	);
};
