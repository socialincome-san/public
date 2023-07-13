import { DefaultPageProps } from '@/app/[lang]/[country]';
import { BaseContainer, Typography } from '@socialincome/ui';
import Section2 from '@/app/[lang]/[country]/(website)/(home)/section-2';
import Section1 from '@/app/[lang]/[country]/(website)/(home)/section-1';

export default async function Page(props: DefaultPageProps) {
	return (
		<>
			<Section1 {...props} />
			<Section2 {...props} />

			{props.params.country === 'ch' && (
				<BaseContainer className="bg-blue-50">
					<div className="flex h-screen flex-row items-center">
						<div className="flex-1 p-8">
							<Typography size="5xl">Who should, if not us here in Switzerland?</Typography>
						</div>
					</div>
				</BaseContainer>
			)}
		</>
	);
}
