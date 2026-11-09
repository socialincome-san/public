import type { Metadata } from 'next';
import { type PropsWithChildren } from 'react';

// The auth pages are client components, so their metadata lives here.
export const metadata: Metadata = {
	robots: { index: false, follow: false },
};

export default function Layout({ children }: PropsWithChildren) {
	return children;
}
