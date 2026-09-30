'use client';

import { Button } from '@/components/button/button';
import { Input } from '@/components/input/input';
import { useActionState } from 'react';
import { login } from './actions';

export function LoginForm() {
	const [error, formAction] = useActionState(login, null);

	return (
		<form
			action={formAction}
			className="flex min-h-[40vh] flex-1 flex-col items-center justify-center gap-6 px-4 text-center"
		>
			<Input className="w-full max-w-xl" name="password" type="password" placeholder="Password" />
			{error && <p className="text-destructive text-sm">{error}</p>}
			<Button type="submit" className="mx-auto rounded-full px-6">
				Login
			</Button>
		</form>
	);
}
