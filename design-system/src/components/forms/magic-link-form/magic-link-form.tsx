'use client';

import { ArrowRight, Loader2 } from 'lucide-react';
import { type FormEvent, type ReactNode, useId } from 'react';
import { Button } from '../../actions/button/button';
import { Input } from '../input/input';
import { Label } from '../label/label';

type MagicLinkFormProps = {
	title: string;
	description?: string;
	emailLabel: string;
	emailPlaceholder?: string;
	submitLabel: string;
	sendingLabel: string;
	// Small print below the button, e.g. how the magic link works
	hint?: ReactNode;
	defaultEmail?: string;
	error?: string;
	sending?: boolean;
	onSubmit: (email: string) => void;
};

export const MagicLinkForm = ({
	title,
	description,
	emailLabel,
	emailPlaceholder,
	submitLabel,
	sendingLabel,
	hint,
	defaultEmail,
	error,
	sending = false,
	onSubmit,
}: MagicLinkFormProps) => {
	const id = useId();
	const errorId = `${id}-error`;

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const email = new FormData(event.currentTarget).get('email');
		onSubmit(typeof email === 'string' ? email.trim() : '');
	};

	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-col gap-2">
				<h1 className="text-foreground text-3xl font-medium tracking-tight">{title}</h1>
				{description ? <p className="text-muted-foreground text-base">{description}</p> : null}
			</div>

			<form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
				<div className="flex flex-col gap-2">
					<Label htmlFor={id} invalid={Boolean(error)}>
						{emailLabel}
					</Label>
					<Input
						id={id}
						name="email"
						type="email"
						autoComplete="email"
						inputMode="email"
						required
						placeholder={emailPlaceholder}
						defaultValue={defaultEmail}
						disabled={sending}
						aria-invalid={error ? true : undefined}
						aria-describedby={error ? errorId : undefined}
					/>
					{error ? (
						<p id={errorId} className="text-destructive text-sm">
							{error}
						</p>
					) : null}
				</div>

				<Button type="submit" size="md" fullWidth disabled={sending} aria-live="polite">
					{sending ? (
						<>
							<Loader2 className="motion-safe:animate-spin" />
							{sendingLabel}
						</>
					) : (
						<>
							{submitLabel}
							<ArrowRight />
						</>
					)}
				</Button>
			</form>

			{hint ? <p className="text-muted-foreground text-sm">{hint}</p> : null}
		</div>
	);
};
