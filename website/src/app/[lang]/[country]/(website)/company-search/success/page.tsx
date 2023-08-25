import { DefaultPageProps } from '@/app/[lang]/[country]';
import { BaseContainer, Typography } from '@socialincome/ui';
import { CreateUsergorm } from './create-user-form';
import { LinkGoogleForm } from './link-google-form';

export default async function Page({ searchParams }: DefaultPageProps) {
	// Save the submission server side ? 
	return (
		<BaseContainer className="bg-base-yellow min-h-screen">
			<div className="flex min-h-[calc(100vh-theme(spacing.20))] flex-col items-center lg:flex-row">
				<div className="flex flex-1 items-center p-4 text-center lg:p-8">
					<Typography size="4xl" weight="bold" className="flex-1 text-center">Thanks!</Typography>
				</div>
			</div>
		</BaseContainer>
	);
}
