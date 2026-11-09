'use client';

import { Button } from '@socialincome/design-system/actions/button/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@socialincome/design-system/overlays/dialog/dialog';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const DonationSuccessDialog = () => {
	const t = useTranslations('portal-operations');
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
			<DialogContent size="sm">
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
