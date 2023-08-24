'use client';

import { DefaultLayoutProps } from '@/app/[lang]/[country]';
import Navbar from '@/components/navbar/navbar';
import { usePathname } from 'next/navigation';
import { PropsWithChildren } from 'react';

/**
 * This wrapper component is needed so that the background color of the navbar can be changed depending on route.
 */
export default function NavbarWrapper({ params }: PropsWithChildren<DefaultLayoutProps>) {
	const pathname = usePathname();
	const baseSegment = pathname?.split('/')[3];
	let backgroundColor;

	switch (baseSegment) {
		case 'about-us':
			backgroundColor = 'bg-neutral-100';
			break;
		default:
			backgroundColor = 'bg-base-blue';
	}

	return <Navbar params={params} backgroundColor={backgroundColor} />;
	// return <Navbar params={params} backgroundColor={backgroundColor} />;
}
