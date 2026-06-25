'use client';

import { RichtextButtonHeaderBlock } from '@/components/content-blocks/richtext-button-header';
import { CreateProgramModal } from '@/components/create-program-wizard/create-program-modal';
import type { RichtextButtonHeader } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';

type Props = {
	blok: RichtextButtonHeader;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const HomePageRichtextButtonHeaderBlock = ({ blok, lang, region }: Props) => {
	return (
		<CreateProgramModal
			trigger={({ open }) => <RichtextButtonHeaderBlock blok={blok} lang={lang} region={region} buttonAction={open} />}
		/>
	);
};
