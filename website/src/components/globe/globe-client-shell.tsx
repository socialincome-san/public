'use client';

import type { GlobeContribution } from '@/lib/services/contribution/contribution-globe.types';
import dynamic from 'next/dynamic';

const GlobeClient = dynamic(() => import('./globe-client').then((module) => module.GlobeClient), {
	ssr: false,
	loading: () => null,
});

type Props = {
	contributions: GlobeContribution[];
};

export const GlobeClientShell = ({ contributions }: Props) => <GlobeClient contributions={contributions} />;
