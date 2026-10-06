'use client';

import { Button } from '@socialincome/design-system/button/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@socialincome/design-system/dialog/dialog';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const DonationSuccessDialog = () => {
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
					<DialogTitle>Thank you for your donation</DialogTitle>
					<DialogDescription>
						Your payment was successful. The contribution will be reflected in the program overview shortly.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button onClick={() => handleOpenChange(false)}>Close</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
