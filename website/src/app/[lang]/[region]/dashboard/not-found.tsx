import { NotFound as NotFoundComponent } from '@/components/not-found';
import { Button } from '@socialincome/design-system/actions/button/button';
import Link from 'next/link';

export default function NotFound() {
	return (
		<NotFoundComponent>
			<Button asChild>
				<Link href="/dashboard/subscriptions">Return to dashboard</Link>
			</Button>
		</NotFoundComponent>
	);
}
