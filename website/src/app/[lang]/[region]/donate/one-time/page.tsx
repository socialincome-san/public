import { DefaultPageProps } from '@/app/[lang]/[region]';
import OneTimeDonationForm from '@/app/[lang]/[region]/donate/one-time/one-time-donation-form';
import { BaseContainer, Typography } from '@socialincome/ui';

// TODO: i18n
export default function Page({ params }: DefaultPageProps) {
	return (
		<BaseContainer className="mx-auto flex max-w-3xl flex-col pt-16">
			<div className="flex flex-col items-center">
				<Typography size="5xl" weight="semibold" color="si-yellow">
					Your Donation
				</Typography>
				<Typography size="3xl" weight="semibold" className="mt-4">
					Make a one-time donation to Social Income
				</Typography>
				<div className="mt-16 w-full">
					<OneTimeDonationForm
						lang={params.lang}
						region={params.region}
						translations={{
							submit: 'Donate',
							currency: 'Currency',
						}}
					/>
				</div>
			</div>
		</BaseContainer>
	);
}
