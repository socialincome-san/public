'use client';

import { BlockWrapper } from '@/components/block-wrapper';
import { Button } from '@/components/button';
import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import type { RichtextButtonHeader } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/services/storyblok/storyblok.utils';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import NextLink from 'next/link';

type Props = {
	blok: RichtextButtonHeader;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	buttonAction?: () => void;
};

export const RichtextButtonHeaderBlock = ({ blok, lang, region, buttonAction }: Props) => {
	const { heading, button, disableMarginTop, disableMarginBottom } = blok;
	const firstButton = button?.[0];
	const buttonLabel = firstButton?.label?.trim();
	const buttonHref = firstButton?.link ? resolveStoryblokLink(firstButton.link, lang, region) : null;
	const hasActionButton = Boolean(buttonLabel && buttonAction);
	const hasLinkButton = Boolean(buttonLabel && buttonHref && !buttonAction);

	if (!heading && !hasLinkButton && !hasActionButton) {
		return null;
	}

	return (
		<BlockWrapper
			disableMarginBottom={disableMarginBottom}
			disableMarginTop={disableMarginTop}
			{...storyblokEditable(blok as SbBlokData)}
		>
			<div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
				{heading && (
					<div className="text-foreground text-lg">
						<RichTextRenderer richTextDocument={heading} />
					</div>
				)}
				{buttonLabel && buttonHref && !buttonAction && (
					<Button variant="outline" className="self-center" asChild>
						<NextLink href={buttonHref}>{buttonLabel}</NextLink>
					</Button>
				)}
				{buttonLabel && buttonAction && (
					<Button type="button" variant="outline" className="self-center" onClick={buttonAction}>
						{buttonLabel}
					</Button>
				)}
			</div>
		</BlockWrapper>
	);
};
