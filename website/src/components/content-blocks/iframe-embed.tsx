import type { IframeEmbed } from '@/generated/storyblok/types/109655/storyblok-components';
import { parseEmbedCode } from '@/lib/utils/embed-code';
import { Embed } from '@socialincome/design-system/data-display/embed/embed';
import { storyblokEditable } from '@storyblok/react';

type Props = {
	blok: IframeEmbed;
};

export const IframeEmbedBlock = ({ blok }: Props) => {
	const embed = parseEmbedCode(blok.code);

	if (!embed) {
		return null;
	}

	// Screen readers announce the frame by its title, so fall back to the caption or the site's domain.
	const title = [embed.title, blok.caption?.trim()].find(Boolean) ?? embed.hostname;

	return (
		<div {...storyblokEditable(blok)}>
			<Embed src={embed.src} height={embed.height} title={title} caption={blok.caption} />
		</div>
	);
};
