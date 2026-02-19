'use client';

import { Button } from '@/components/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/dialog';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function DonationSuccessDialog() {
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
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Thank you for your donation</DialogTitle>
				</DialogHeader>
				<p className="text-muted-foreground text-sm">
					Your payment was successful. The contribution will be reflected in the program overview shortly.
				</p>
				<DialogFooter>
					<Button onClick={() => handleOpenChange(false)}>Close</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
