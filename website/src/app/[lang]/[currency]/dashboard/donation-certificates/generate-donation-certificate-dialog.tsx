'use client';

import { DEFAULT_DONATION_CERTIFICATE_LANGUAGE as DEFAULT_LANGUAGE, type LanguageCode } from '@/lib/types/language';
import { now } from '@/lib/utils/now';
import { createCurrentContributorDonationCertificateAction } from '@/modules/donation-certificates/donation-certificate.actions';
import { Button } from '@socialincome/design-system/actions/button/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@socialincome/design-system/forms/select/select';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@socialincome/design-system/overlays/dialog/dialog';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

const CURRENT_YEAR = now().getFullYear();
const CERTIFICATE_YEARS = Array.from({ length: 6 }, (_value, index) => CURRENT_YEAR - 5 + index);
const LANGUAGES: LanguageCode[] = ['en', 'de', 'fr', 'it'];
export default function GenerateDonationCertificateDialog({
	open,
	setOpen,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
}) {
	const [year, setYear] = useState<number>(CURRENT_YEAR - 1);
	const [language, setLanguage] = useState<LanguageCode | undefined>(DEFAULT_LANGUAGE);
	const [isLoading, startTransition] = useTransition();
	const [success, setSuccess] = useState<boolean>();
	const [error, setError] = useState<string | undefined>();
	const t = useTranslations('website-me');

	const generateCertificates = () => {
		setSuccess(false);
		setError(undefined);
		startTransition(async () => {
			const result = await createCurrentContributorDonationCertificateAction({ year, language });
			if (!result.success) {
				setError(result.error);
			} else {
				setSuccess(true);
			}
		});
	};

	const getErrorMessage = (errorCode: string) => {
		if (errorCode === 'noContributions') {
			return t('donation-certificates.no-contributions');
		}
		if (errorCode === 'alreadyExists') {
			return t('donation-certificates.already-exists');
		}

		return t('donation-certificates.technical-error');
	};

	const onOpenChange = (open: boolean) => {
		setSuccess(false);
		setError(undefined);
		setOpen(open);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="md">
				<DialogHeader>
					<DialogTitle>{t('donation-certificates.generate-dialog.dialog_title')}</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-6">
					<div className="flex flex-col gap-2">
						<p className="font-medium">{t('donation-certificates.generate-dialog.label_year')}</p>
						<p className="text-muted-foreground mb-1 text-xs">
							{t('donation-certificates.generate-dialog.description_year')}
						</p>
						<Select value={year.toString()} onValueChange={(e: string) => setYear(parseInt(e))}>
							<SelectTrigger>
								<SelectValue placeholder={t('donation-certificates.generate-dialog.placeholder_year')} />
							</SelectTrigger>
							<SelectContent>
								{CERTIFICATE_YEARS.map((year) => (
									<SelectItem value={year.toString()} key={year}>
										{year}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex flex-col gap-2">
						<p className="font-medium">{t('donation-certificates.generate-dialog.label_language')}</p>
						<p className="text-muted-foreground mb-1 text-xs">
							{t('donation-certificates.generate-dialog.description_language')}
						</p>
						<Select
							value={language}
							disabled={!language}
							onValueChange={(selectedLanguage: string) =>
								setLanguage(LANGUAGES.find((candidate) => candidate === selectedLanguage))
							}
						>
							<SelectTrigger>
								<SelectValue placeholder={t('donation-certificates.generate-dialog.placeholder_language')} />
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

					<Button disabled={isLoading} fullWidth onClick={() => generateCertificates()}>
						{isLoading
							? t('donation-certificates.generate-dialog.state_generating')
							: t('donation-certificates.generate-dialog.button_generate')}
					</Button>

					{Boolean(success ?? error) && (
						<div className="bg-muted border-border max-w-[540px] rounded-lg border p-2 text-xs">
							{success && (
								<p className="text-confirm text-sm">{t('donation-certificates.generate-dialog.status_success')}</p>
							)}
							{error && <p className="text-destructive text-sm">{getErrorMessage(error)}</p>}
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{t('donation-certificates.generate-dialog.button_close')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
