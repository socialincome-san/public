'use client';

import type { GlobeContribution } from '@/lib/services/contribution/contribution-globe.types';
import dynamic from 'next/dynamic';

const GlobeClient = dynamic(() => import('./globe-client').then((module) => module.GlobeClient), {
	ssr: false,
	loading: () => null,
});

type Props = {
	contributions: GlobeContribution[];
	locale: string;
};

export const GlobeClientShell = ({ contributions, locale }: Props) => (
	<GlobeClient contributions={contributions} locale={locale} />
);
