'use client';

import { type CountryCode } from '@/generated/prisma/enums';
import { createResolvedPromiseHook } from '@/lib/hooks/use-resolved-promise';
import { createContext, use, type ReactNode } from 'react';

const VisitorCountryContext = createContext<Promise<CountryCode | null>>(Promise.resolve(null));

const useResolvedVisitorCountry = createResolvedPromiseHook<CountryCode | null>();

// The layout passes the country unresolved, so the static shell needs no request data.
export const VisitorCountryProvider = ({
	country,
	children,
}: {
	country: Promise<CountryCode | null>;
	children: ReactNode;
}) => <VisitorCountryContext value={country}>{children}</VisitorCountryContext>;

export const useIsSwissVisitor = () => useResolvedVisitorCountry(use(VisitorCountryContext))?.value === 'CH';
