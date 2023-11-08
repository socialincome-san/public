'use client';

import { Typography } from '@socialincome/ui';
import classNames from 'classnames';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function LayoutTab(tab: { title: string; href: string }) {
	const pathname = usePathname();

	return (
		<Link
			href={tab.href}
			className={classNames('border-b-2 px-5 py-2', {
				'border-b-si-yellow': pathname === tab.href,
			})}
		>
			<Typography size="lg">{tab.title}</Typography>
		</Link>
	);
}
