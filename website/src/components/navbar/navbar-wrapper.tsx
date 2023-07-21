'use client';

import { DefaultPageProps } from '@/app/[lang]/[country]';
import { usePathname } from 'next/navigation';
import { PropsWithChildren } from 'react';
import Navbar from './navbar';

export default function NavbarWrapper({ params }: PropsWithChildren<DefaultPageProps>) {
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
}
