'use client';

import { ContributorSession } from '@/lib/services/contributor/contributor.types';
import Link from 'next/link';
import { Logo } from './logo';

export const NavbarMobile = ({ contributor }: { contributor?: ContributorSession }) => {
	return (
		<nav className="container flex h-20 items-center justify-between">
			<Link href="/">
				<Logo />
			</Link>
			BACK TO WEBSITE
		</nav>
	);
};
