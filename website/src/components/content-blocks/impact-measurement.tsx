import { ImpactMeasurementResultsSkeleton } from '@/app/[lang]/[region]/programs/impact-measurement/results-skeleton';
import { ImpactMeasurementView } from '@/app/[lang]/[region]/programs/impact-measurement/view';
import type { AnySearchParams } from '@/app/page-props';
import type { ImpactMeasurement } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { storyblokEditable } from '@storyblok/react';
import { Suspense } from 'react';

type Props = {
	blok: ImpactMeasurement;
	lang: WebsiteLanguage;
	searchParams?: Promise<AnySearchParams>;
};

const ImpactMeasurementForSearchParams = async ({ lang, searchParams }: Omit<Props, 'blok'>) => (
	<ImpactMeasurementView lang={lang} searchParams={(await searchParams) ?? {}} />
);

export const ImpactMeasurementBlock = ({ blok, lang, searchParams }: Props) => {
	return (
		<div {...storyblokEditable(blok)}>
			<Suspense fallback={<ImpactMeasurementResultsSkeleton />}>
				<ImpactMeasurementForSearchParams lang={lang} searchParams={searchParams} />
			</Suspense>
		</div>
	);
};
