import { DefaultPageProps } from '@/app/[lang]/[country]';
import { BaseContainer, Typography } from '@socialincome/ui';

export default function Section3({ params }: DefaultPageProps) {
	return (
		<BaseContainer backgroundColor="bg-red-50" className="flex flex-col justify-center space-y-8 py-20 sm:min-h-screen">
			<div className="flex-1 p-8">
				<Typography size="5xl">Who should, if not us here in Switzerland?</Typography>
			</div>
		</BaseContainer>
	);
}
