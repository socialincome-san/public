import { NotFound as NotFoundComponent } from '@/components/not-found';
import { Button } from '@socialincome/design-system/button/button';
import Link from 'next/link';

export default function NotFound() {
	return (
		<NotFoundComponent>
			<Button asChild>
				<Link href="/partner-space/recipients">Return to partner space</Link>
			</Button>
		</NotFoundComponent>
	);
}
