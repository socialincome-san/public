'use client';

import { DefaultPageProps } from '@/app/[lang]/[country]';
import { BaseContainer, Typography } from '@socialincome/ui';

export default function Page({ params }: DefaultPageProps) {
	return (
		<BaseContainer className="bg-base-blue min-h-screen">
			<Typography>Coming soon</Typography>
		</BaseContainer>
	);
}
