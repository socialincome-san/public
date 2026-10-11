'use client';

import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import type { RichtextButtonHeader } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { resolveStoryblokLink } from '@/lib/storyblok/storyblok-utils';
import { Button } from '@socialincome/design-system/actions/button/button';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { storyblokEditable } from '@storyblok/react';
import NextLink from 'next/link';

type Props = {
	blok: RichtextButtonHeader;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	buttonAction?: () => void;
};

export const RichtextButtonHeaderBlock = ({ blok, lang, currency, buttonAction }: Props) => {
	const { heading, button, disableMarginTop, disableMarginBottom } = blok;
	const firstButton = button?.[0];
	const buttonLabel = firstButton?.label?.trim();
	const buttonHref = firstButton?.link ? resolveStoryblokLink(firstButton.link, lang, currency) : null;
	const hasActionButton = Boolean(buttonLabel && buttonAction);
	const hasLinkButton = Boolean(buttonLabel && buttonHref && !buttonAction);

	if (!heading && !hasLinkButton && !hasActionButton) {
		return null;
	}

	return (
		<BlockWrapper disableMarginBottom={disableMarginBottom} disableMarginTop={disableMarginTop} {...storyblokEditable(blok)}>
			<div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
				{heading && (
					<div className="text-foreground text-lg">
						<RichTextRenderer richTextDocument={heading} />
					</div>
				)}
				{buttonLabel && buttonHref && !buttonAction && (
					<Button variant="outline" asChild>
						<NextLink href={buttonHref}>{buttonLabel}</NextLink>
					</Button>
				)}
				{buttonLabel && buttonAction && (
					<Button type="button" variant="outline" onClick={buttonAction}>
						{buttonLabel}
					</Button>
				)}
			</div>
		</BlockWrapper>
	);
};
