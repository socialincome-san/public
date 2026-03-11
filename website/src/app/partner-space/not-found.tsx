import { Button } from '@/components/button';
import { NotFound as NotFoundComponent } from '@/components/not-found';
import { ROUTES } from '@/lib/constants/routes';
import Link from 'next/link';

export default function NotFound() {
	return (
		<NotFoundComponent>
			<Button asChild>
				<Link href={ROUTES.partnerSpaceRecipients}>Return to partner space</Link>
			</Button>
		</NotFoundComponent>
	);
}
