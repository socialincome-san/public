import { BlockButton, hasBlockButton } from '@/components/content-blocks/block-button';
import { blockMargins } from '@/components/content-blocks/block-margins';
import { RichTextRenderer } from '@/components/storyblok/rich-text-renderer';
import type { RichtextButtonHeader } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { storyblokEditable } from '@storyblok/react';

type Props = {
	blok: RichtextButtonHeader;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const RichtextButtonHeaderBlock = ({ blok, lang, currency }: Props) => {
	const { heading, button, buttonAction, buttonStyle } = blok;

	if (!heading && !hasBlockButton(button?.[0], buttonAction, lang, currency)) {
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
				<BlockButton
					button={button?.[0]}
					action={buttonAction}
					variant={buttonStyle === 'primary' ? 'default' : 'outline'}
					lang={lang}
					currency={currency}
				/>
			</div>
		</BlockWrapper>
	);
};
