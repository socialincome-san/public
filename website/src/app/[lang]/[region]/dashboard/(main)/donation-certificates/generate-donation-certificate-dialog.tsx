'use client';

import { Button } from '@/components/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { generateDonationCertificateForCurrentUser } from '@/lib/server-actions/donation-certificates-actions';
import { DonationCertificateError } from '@/lib/services/donation-certificate/types';
import { DEFAULT_DONATION_CERTIFICATE_LANGUAGE as DEFAULT_LANGUAGE, LanguageCode } from '@/lib/types/language';
import _ from 'lodash';
import { useState, useTransition } from 'react';

const CURRENT_YEAR = new Date().getFullYear();
const LANGUAGES: LanguageCode[] = ['en', 'de', 'fr', 'it'];
export default function GenerateDonationCertificateDialog({
	open,
	setOpen,
	lang,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	lang: WebsiteLanguage;
}) {
	const [year, setYear] = useState<number>(CURRENT_YEAR - 1);
	const [language, setLanguage] = useState<LanguageCode | undefined>(DEFAULT_LANGUAGE);
	const [isLoading, startTransition] = useTransition();
	const [success, setSuccess] = useState<boolean>();
	const [error, setError] = useState<string | undefined>();
	const translator = useTranslator(lang, 'website-me');

	const generateCertificates = () => {
		setSuccess(false);
		setError(undefined);
		startTransition(async () => {
			const result = await generateDonationCertificateForCurrentUser(year, language);
			if (!result.success) setError(result.error);
			else setSuccess(true);
		});
	};

	const getErrorMessage = (errorCode: string) => {
		switch (errorCode) {
			case DonationCertificateError.noContributions:
				return translator?.t('donation-certificates.no-contributions');
			case DonationCertificateError.alreadyExists:
				return translator?.t('donation-certificates.already-exists');
			default:
				return translator?.t('donation-certificates.technical-error');
		}
	};

	const onOpenChange = (open: boolean) => {
		setSuccess(false);
		setError(undefined);
		setOpen(open);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>{translator?.t('donation-certificates.generate-dialog.dialog_title')}</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-6">
					<div className="flex flex-col gap-2">
						<p className="font-medium">{translator?.t('donation-certificates.generate-dialog.label_year')}</p>
						<p className="text-muted-foreground mb-1 text-xs">
							{translator?.t('donation-certificates.generate-dialog.description_year')}
						</p>
						<Select value={year.toString()} onValueChange={(e: string) => setYear(parseInt(e))}>
							<SelectTrigger>
								<SelectValue placeholder={translator?.t('donation-certificates.generate-dialog.placeholder_year')} />
							</SelectTrigger>
							<SelectContent>
								{_.range(CURRENT_YEAR - 5, CURRENT_YEAR + 1).map((year) => (
									<SelectItem value={year.toString()} key={year}>
										{year}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex flex-col gap-2">
						<p className="font-medium">{translator?.t('donation-certificates.generate-dialog.label_language')}</p>
						<p className="text-muted-foreground mb-1 text-xs">
							{translator?.t('donation-certificates.generate-dialog.description_language')}
						</p>
						<Select value={language} disabled={!language} onValueChange={(l: string) => setLanguage(l as LanguageCode)}>
							<SelectTrigger>
								<SelectValue
									placeholder={translator?.t('donation-certificates.generate-dialog.placeholder_language')}
								/>
							</SelectTrigger>
							<SelectContent>
								{LANGUAGES.map((langCode) => (
									<SelectItem value={langCode} key={langCode}>
										{langCode.toUpperCase()}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Button
						disabled={isLoading}
						className="flex w-full items-center justify-center gap-2"
						onClick={() => generateCertificates()}
					>
						{isLoading
							? translator?.t('donation-certificates.generate-dialog.state_generating')
							: translator?.t('donation-certificates.generate-dialog.button_generate')}
					</Button>

					{(success || error) && (
						<div className="bg-muted border-border max-w-[540px] rounded-lg border p-2 text-xs">
							{success && (
								<p className="text-sm text-green-700">
									{translator?.t('donation-certificates.generate-dialog.status_success')}
								</p>
							)}
							{error && <p className="text-sm text-red-700">{getErrorMessage(error)}</p>}
						</div>
					)}
				</div>

				<DialogFooter className="mt-4">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{translator?.t('donation-certificates.generate-dialog.button_close')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
