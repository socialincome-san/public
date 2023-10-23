import { Translator } from "@socialincome/shared/src/utils/i18n";
import { DefaultPageProps } from "../.."; 
import { BaseContainer, Typography } from "@socialincome/ui";


export default async function Section1({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-bank-details'],
	});

	return (
		<BaseContainer className="my-28 flex flex-col items-left space-y-8 pl-8">
			<Typography size="3xl" weight="bold">
				{translator.t('section-1.bankIntroText') + ": "}
			</Typography> 

			<div className="flex flex-col space-y-4">
				<Typography size="xl" weight="bold">
					{translator.t('section-1.bankInfoTextRecurring')}
				</Typography> 
				<div>
					<Typography as="span" size="xl" weight="medium" color="muted-foreground">
						{translator.t('section-1.bankPrompt') + ": "}
					</Typography> 
					<Typography as="span" size="xl">
						{translator.t('section-1.bankPostFinance')}
					</Typography> 
				</div>
				<div>
					<Typography as="span" size="xl" weight="medium" color="muted-foreground">
						{translator.t('section-1.bankAccountHolderPrompt') + ": "}
					</Typography> 
					<Typography as="span" size="xl">
						{translator.t('section-1.bankAccountHolder')}
					</Typography> 
				</div>
				<div>
					<Typography as="span" size="xl" weight="medium" color="muted-foreground">
						{translator.t('section-1.bankIBANPrompt') + ": "}
					</Typography> 
					<Typography as="span" size="xl">
						{translator.t('section-1.bankIBAN1')}
					</Typography> 
				</div>
				<div>
					<Typography as="span" size="xl" weight="medium" color="muted-foreground">
						{translator.t('section-1.bankBICPrompt') + ": "}
					</Typography> 
					<Typography as="span" size="xl">
						{translator.t('section-1.bankBIC')}
					</Typography> 
				</div>
			</div>

			<div className="flex flex-col space-y-4">
				<Typography size="xl" weight="bold">
					{translator.t('section-1.bankOneTime')}
				</Typography> 
				<div>
					<Typography as="span" size="xl" weight="medium" color="muted-foreground">
						{translator.t('section-1.bankPrompt') + ": "}
					</Typography> 
					<Typography as="span" size="xl">
						{translator.t('section-1.bankPostFinance')}
					</Typography> 
				</div>
				<div>
					<Typography as="span" size="xl" weight="medium" color="muted-foreground">
						{translator.t('section-1.bankAccountHolderPrompt') + ": "}
					</Typography> 
					<Typography as="span" size="xl">
						{translator.t('section-1.bankAccountHolder')}
					</Typography> 
				</div>
				<div>
					<Typography as="span" size="xl" weight="medium" color="muted-foreground">
						{translator.t('section-1.bankIBANPrompt') + ": "}
					</Typography> 
					<Typography as="span" size="xl">
						{translator.t('section-1.bankIBAN2')}
					</Typography> 
				</div>
				<div>
					<Typography as="span" size="xl" weight="medium" color="muted-foreground">
						{translator.t('section-1.bankBICPrompt') + ": "}
					</Typography> 
					<Typography as="span" size="xl">
						{translator.t('section-1.bankBIC')}
					</Typography> 
				</div>
			</div>
		</BaseContainer>
	);
}
