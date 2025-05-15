'use client';

import LoginForm, { LoginFormTranslations } from '@/components/login-form/login-form';
import { WebsiteLanguage, WebsiteRegion } from '@/i18n';
import { generateQrBillSvg } from '@/utils/qr-bill';
import { Button } from '@socialincome/ui';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { SocialSignInButtons } from '../../../(website)/login/social-sign-in-buttons';
import { GuestForm, GuestFormTranslations } from './guest-form';

export type BankTransferTranslations = {
	firstName: string;
	lastName: string;
	email: string;
	plan: string;
	yourContribution: string;
	fullSocialIncome: string;
	partialSocialIncome: string;
	weMatchTheMissing: string;
	generateQrBill: string;
	confirmMonthlyOrder: string;
	transferFeesNote: string;
	plusPlanLink: string;
	proceedAsGuest: string;
	errors: {
		emailRequired: string;
		emailInvalid: string;
		qrBillError: string;
	};
	loginForm: LoginFormTranslations;
	guestForm: GuestFormTranslations;
};

type BankTransferProps = {
	amount: number;
	paymentIntervalMonths: number;
	translations: BankTransferTranslations;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export function BankTransfer({ amount, paymentIntervalMonths, translations, lang, region }: BankTransferProps) {
	const [qrBillSvg, setQrBillSvg] = useState<string | null>(null);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const onGuestCreated = async ({ paymentReferenceId }: { paymentReferenceId: number }) => {
		try {
			setQrBillSvg(generateQrBillSvg(amount, paymentIntervalMonths, paymentReferenceId));
			setIsSubmitted(true);
		} catch (error) {
			toast.error(translations.errors.qrBillError);
		}
	};

	return (
		<div className="border-accent bg-card-muted !mt-[-2px] rounded-b-lg border-2 p-4 md:rounded-tl-lg md:p-8">
			<>
				{isSubmitted && qrBillSvg ? (
					<>
						<div className="my-8 flex justify-center space-y-4">
							<div dangerouslySetInnerHTML={{ __html: qrBillSvg }} className="max-w-full" />
						</div>
						<Button size="lg" type="button" className="w-full" onClick={() => setIsSubmitted(false)}>
							{translations.proceedAsGuest}
						</Button>
					</>
				) : (
					<div className="flex w-full flex-col gap-4 sm:flex-row">
						<div className="md:w-2/5">
							<GuestForm region={region} translations={translations.guestForm} onGuestCreated={onGuestCreated} />
						</div>
						<div className="flex items-center justify-center md:w-1/5">OR</div>
						<div className="flex flex-col gap-4 md:w-2/5">
							<LoginForm translations={translations.loginForm} lang={lang} region={region} />
							<SocialSignInButtons
								lang={lang}
								region={region}
								translations={{
									signInWithGoogle: 'sign-in-with-google',
								}}
							/>
						</div>
					</div>
				)}
			</>
		</div>
	);
}
