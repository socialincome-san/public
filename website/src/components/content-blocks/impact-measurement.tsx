import { ImpactMeasurementView } from '@/app/[lang]/[region]/programs/impact-measurement/view';
import type { ImpactMeasurement } from '@/generated/storyblok/types/109655/storyblok-components';
import { getWebsiteRootParams } from '@/lib/i18n/website-root-params';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import type { ParsedUrlQueryInput } from 'querystring';

type Props = {
	blok: ImpactMeasurement;
	searchParams?: ParsedUrlQueryInput;
};

export const ImpactMeasurementBlock = async ({ blok, searchParams }: Props) => {
	const { lang } = await getWebsiteRootParams();

	return (
		<div {...storyblokEditable(blok as SbBlokData)}>
			<ImpactMeasurementView lang={lang} searchParams={searchParams ?? {}} />
		</div>
	);
};
