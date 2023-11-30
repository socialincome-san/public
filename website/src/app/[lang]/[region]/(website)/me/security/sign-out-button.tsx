'use client';

import { Button, Typography } from '@socialincome/ui';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from 'reactfire';

type SignOutButtonProps = {
	translations: {
		title: string;
		buttonText: string;
	};
};

export function SignOutButton({ translations }: SignOutButtonProps) {
	const router = useRouter();
	const auth = useAuth();

	return (
		<div>
			<Typography weight="medium" size="lg">
				{translations.title}
			</Typography>
			<Button variant="secondary" className="mt-2" onClick={() => signOut(auth).then(() => router.push('/'))}>
				{translations.buttonText}
			</Button>
		</div>
	);
}
