'use client';

import { blockMargins } from '@/components/content-blocks/block-margins';
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
	const { heading, button, buttonStyle } = blok;
	const buttonVariant = buttonStyle === 'primary' ? 'default' : 'outline';
	const firstButton = button?.[0];
	const buttonLabel = firstButton?.label?.trim();
	const buttonHref = firstButton?.link ? resolveStoryblokLink(firstButton.link, lang, currency) : null;
	const hasActionButton = Boolean(buttonLabel && buttonAction);
	const hasLinkButton = Boolean(buttonLabel && buttonHref && !buttonAction);

	if (!heading && !hasLinkButton && !hasActionButton) {
		return null;
	}

	return (
		<BlockWrapper {...blockMargins(blok)} {...storyblokEditable(blok)}>
			<div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
				{heading && (
					<div className="text-foreground text-lg">
						<RichTextRenderer richTextDocument={heading} />
					</div>
				)}
				{buttonLabel && buttonHref && !buttonAction && (
					<Button variant={buttonVariant} asChild>
						<NextLink href={buttonHref}>{buttonLabel}</NextLink>
					</Button>
				)}
				{buttonLabel && buttonAction && (
					<Button type="button" variant={buttonVariant} onClick={buttonAction}>
						{buttonLabel}
					</Button>
				)}
			</div>
		</BlockWrapper>
	);
};
