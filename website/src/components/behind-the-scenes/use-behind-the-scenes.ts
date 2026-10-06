'use client';

import { createContext, useContext } from 'react';

type BehindTheScenesContextValue = {
	isOpen: boolean;
	toggle: () => void;
	panelId: string;
};

export const BehindTheScenesContext = createContext<BehindTheScenesContextValue | null>(null);

export const useBehindTheScenes = (): BehindTheScenesContextValue => {
	const context = useContext(BehindTheScenesContext);
	if (!context) {
		throw new Error('useBehindTheScenes must be used within BehindTheScenesProvider');
	}

	return context;
};
