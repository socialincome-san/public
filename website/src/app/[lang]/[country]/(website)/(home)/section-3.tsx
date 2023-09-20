import { DefaultPageProps } from '@/app/[lang]/[country]';
import { BaseContainer, Typography } from '@socialincome/ui';

export default function Section3({ params }: DefaultPageProps) {
	if (params.country === 'ch') {
		return (
			<BaseContainer>
				<div className="flex h-screen flex-row items-center">
					<div className="flex-1 p-8">
						<Typography size="5xl">Who should, if not us here in Switzerland?</Typography>
					</div>
				</div>
			</BaseContainer>
		);
	}
}
