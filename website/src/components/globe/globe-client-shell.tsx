'use client';

import dynamic from 'next/dynamic';

const GlobeClient = dynamic(() => import('./globe-client').then((module) => module.GlobeClient), {
	ssr: false,
	loading: () => null,
});

export const GlobeClientShell = () => <GlobeClient />;
