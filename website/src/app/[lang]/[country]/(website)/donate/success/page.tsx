import { DefaultPageProps } from '@/app/[lang]/[country]';
import { BaseContainer, Typography } from '@socialincome/ui';

export default function Page({ params, searchParams }: DefaultPageProps) {
	return (
		<BaseContainer>
			<Typography>Great Success</Typography>
		</BaseContainer>
	);
}
