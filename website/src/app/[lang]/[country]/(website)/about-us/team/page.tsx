import { DefaultPageProps } from '@/app/[lang]/[country]';
import { BaseContainer, Typography } from '@socialincome/ui';

export default async function Page(props: DefaultPageProps) {
	return (
		<BaseContainer className="min-h-screen">
			<Typography size="3xl">Team</Typography>
			<Typography>Coming soon</Typography>
		</BaseContainer>
	);
}
