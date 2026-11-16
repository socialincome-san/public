'use client';

import { Button } from '@socialincome/design-system/actions/button/button';
import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

type Props = {
	href: string;
};

export const CountryPageLink = ({ href }: Props) => {
	const t = useTranslations('create-program-wizard');

	return (
		<Button variant="secondary" size="sm" asChild>
			<Link href={href} target="_blank">
				{t('step1.country_page')}
				<ArrowUpRight aria-hidden />
			</Link>
		</Button>
	);
};
