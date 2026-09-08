import { BlockWrapper } from '@/components/block-wrapper';
import { Button } from '@/components/button/button';
import { focusToObjectPosition } from '@/components/campaign/campaign-submission/storyblok-image-focus';
import type { HeroHeaderImage } from '@/components/storyblok/shared/hero-header';
import { InstagramIcon } from '@/components/svg/instagram';
import { TiktokIcon } from '@/components/svg/tiktok';
import { XIcon } from '@/components/svg/x';
import {
	formatStoryblokResizeUrl,
	getDimensionsFromStoryblokImageUrl,
	getScaledAssetDimensions,
} from '@/lib/services/storyblok/storyblok.utils';
import { cn } from '@/lib/utils/cn';
import { isSafeHref } from '@/lib/utils/string-utils';
import { ExternalLink } from 'lucide-react';
import NextImage from 'next/image';
import type { CSSProperties, ReactNode } from 'react';

const SECTION_IMAGE_MAX_WIDTH = 500;

type Props = {
	heading: string;
	sectionDescription?: string | null;
	sectionImage?: HeroHeaderImage | null;
	instagramHandle?: string | null;
	xHandle?: string | null;
	tiktokHandle?: string | null;
	linkWebsite?: string | null;
};

const trimToNull = (value?: string | null) => {
	const trimmed = value?.trim();
	if (!trimmed) {
		return null;
	}

	return trimmed;
};

const getSocialHandle = (value?: string | null) => {
	const handle = trimToNull(value)?.replace(/^@+/, '');
	if (!handle) {
		return null;
	}

	return handle;
};

const getWebsiteHref = (value?: string | null) => {
	const trimmed = trimToNull(value);
	if (!trimmed) {
		return null;
	}

	const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

	return isSafeHref(href) ? href : null;
};

const getWebsiteLabel = (href: string) => {
	try {
		const url = new URL(href);
		const path = url.pathname === '/' ? '' : url.pathname.replace(/\/$/, '');

		return `${url.host}${path}`;
	} catch {
		return href.replace(/^https?:\/\//i, '').replace(/\/$/, '');
	}
};

type SocialLinkProps = {
	href: string;
	label: string;
	iconOnly?: boolean;
	children: ReactNode;
};

const SocialLink = ({ href, label, iconOnly = false, children }: SocialLinkProps) => (
	<Button variant="outline" size={iconOnly ? 'icon' : 'sm'} className={iconOnly ? undefined : 'h-9 px-4'} asChild>
		<a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
			{children}
		</a>
	</Button>
);

export const CampaignAboutSection = ({
	heading,
	sectionDescription,
	sectionImage,
	instagramHandle,
	xHandle,
	tiktokHandle,
	linkWebsite,
}: Props) => {
	const description = trimToNull(sectionDescription);
	const tiktok = getSocialHandle(tiktokHandle);
	const x = getSocialHandle(xHandle);
	const instagram = getSocialHandle(instagramHandle);
	const websiteHref = getWebsiteHref(linkWebsite);
	const websiteLabel = websiteHref ? getWebsiteLabel(websiteHref) : null;
	const scaledSectionImage = sectionImage?.filename
		? getScaledAssetDimensions({ filename: sectionImage.filename }, SECTION_IMAGE_MAX_WIDTH)
		: null;
	const imageSrc =
		scaledSectionImage && sectionImage?.filename
			? formatStoryblokResizeUrl(sectionImage.filename, scaledSectionImage.width, scaledSectionImage.height)
			: null;
	const naturalSectionImageDimensions = sectionImage?.filename
		? getDimensionsFromStoryblokImageUrl(sectionImage.filename)
		: null;
	const objectPosition =
		sectionImage?.focus && naturalSectionImageDimensions?.width && naturalSectionImageDimensions?.height
			? focusToObjectPosition(sectionImage.focus, naturalSectionImageDimensions.width, naturalSectionImageDimensions.height)
			: undefined;
	const hasLinks = Boolean(tiktok ?? x ?? instagram ?? websiteHref);
	const showTextCard = Boolean(description ?? hasLinks);

	if (!showTextCard && !imageSrc) {
		return null;
	}

	return (
		<BlockWrapper disableMarginTop={true} disableMarginBottom={true} className="my-10">
			<section
				className={cn(
					'grid items-stretch gap-8',
					showTextCard && imageSrc && 'md:grid-cols-[minmax(0,4fr)_minmax(280px,2fr)]',
				)}
			>
				{showTextCard ? (
					<div className="bg-card flex min-w-0 flex-col rounded-3xl p-8 shadow-lg md:p-10">
						<div className="flex flex-col items-start gap-5">
							<h2 className="text-foreground text-3xl leading-none font-semibold text-pretty">{heading}</h2>
							{description ? <p className="text-foreground text-base leading-6 whitespace-pre-wrap">{description}</p> : null}
							{hasLinks ? (
								<div className="flex flex-wrap items-center gap-2">
									{tiktok ? (
										<SocialLink
											href={`https://www.tiktok.com/@${encodeURIComponent(tiktok)}`}
											label={`TikTok @${tiktok}`}
											iconOnly
										>
											<TiktokIcon />
										</SocialLink>
									) : null}
									{x ? (
										<SocialLink href={`https://x.com/${encodeURIComponent(x)}`} label={`X @${x}`} iconOnly>
											<XIcon />
										</SocialLink>
									) : null}
									{instagram ? (
										<SocialLink
											href={`https://www.instagram.com/${encodeURIComponent(instagram)}`}
											label={`Instagram @${instagram}`}
										>
											<InstagramIcon />
											<span>@{instagram}</span>
										</SocialLink>
									) : null}
									{websiteHref && websiteLabel ? (
										<SocialLink href={websiteHref} label={websiteLabel}>
											<span>{websiteLabel}</span>
											<ExternalLink aria-hidden="true" />
										</SocialLink>
									) : null}
								</div>
							) : null}
						</div>
					</div>
				) : null}
				{imageSrc ? (
					<div className="bg-card flex min-h-72 w-full min-w-0 flex-col overflow-hidden rounded-3xl p-3 shadow-lg">
						<div
							className="relative h-full min-h-64 overflow-hidden rounded-xl"
							style={objectPosition ? ({ ['--section-image-object-position']: objectPosition } as CSSProperties) : undefined}
						>
							<NextImage
								src={imageSrc}
								alt={sectionImage?.alt ?? ''}
								fill
								sizes="(max-width: 767px) 100vw, 33vw"
								className={cn('object-cover', objectPosition && '[object-position:var(--section-image-object-position)]')}
								loading="lazy"
							/>
						</div>
					</div>
				) : null}
			</section>
		</BlockWrapper>
	);
};
