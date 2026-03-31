import type { ImpactMeasurement } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import { ImpactMeasurementView } from '@/app/[lang]/[region]/new-website/programs/impact-measurement/view';
import type { ParsedUrlQueryInput } from 'querystring';

type Props = {
	blok: ImpactMeasurement;
	lang: WebsiteLanguage;
	searchParams?: ParsedUrlQueryInput;
};

export const ImpactMeasurementBlock = async ({ blok, lang, searchParams }: Props) => {
	return (
		<div {...storyblokEditable(blok as SbBlokData)}>
			<ImpactMeasurementView lang={lang} searchParams={searchParams ?? {}} />
		</div>
	);
};

