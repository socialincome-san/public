'use client';

import { usePortalOperationsTranslations } from '@/app/portal/portal-operations-translations';
import { Button } from '@socialincome/design-system/actions/button/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@socialincome/design-system/overlays/dialog/dialog';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const DonationSuccessDialog = () => {
	const t = usePortalOperationsTranslations();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const open = searchParams.get('donation') === 'success';

	const handleOpenChange = (next: boolean) => {
		if (!next) {
			router.replace(pathname);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent size="alert">
				<DialogHeader>
					<DialogTitle>{t('program.donation.success_title')}</DialogTitle>
					<DialogDescription>{t('program.donation.success_description')}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button onClick={() => handleOpenChange(false)}>{t('common.close')}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
