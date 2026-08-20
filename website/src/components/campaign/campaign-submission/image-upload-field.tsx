'use client';

import { Label } from '@/components/label';
import { campaignSubmissionConfig } from '@/lib/config/campaign-submission.config';
import { cn } from '@/lib/utils/cn';
import { Camera, Trash2, Upload } from 'lucide-react';
import { useEffect, useId, useRef, type RefObject } from 'react';

type ImageUploadFieldProps = {
	variant: 'avatar' | 'cover';
	label: string;
	previewUrl: string | null;
	error: string | null;
	inputRef: RefObject<HTMLInputElement | null>;
	onChange: (file: File | null) => void;
	disabled?: boolean;
	hint: string;
	uploadLabel: string;
	editLabel?: string;
	removeLabel: string;
};

export const ImageUploadField = ({
	variant,
	label,
	previewUrl,
	error,
	inputRef,
	onChange,
	disabled = false,
	hint,
	uploadLabel,
	editLabel,
	removeLabel,
}: ImageUploadFieldProps) => {
	const hintId = useId();
	const errorId = useId();
	const errorRef = useRef<HTMLParagraphElement>(null);

	useEffect(() => {
		if (!error) {
			return;
		}

		errorRef.current?.scrollIntoView({ block: 'nearest' });
		errorRef.current?.focus();
	}, [error]);

	return (
		<div className="flex flex-col gap-3">
			<Label className={cn(error && 'text-destructive')}>{label}</Label>
			{variant === 'avatar' ? (
				<div className="border-border relative aspect-[16/10] w-full rounded-2xl border border-dashed">
					<button
						type="button"
						disabled={disabled}
						className="hover:bg-muted/40 focus-visible:ring-ring absolute inset-0 rounded-2xl focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
						aria-label={previewUrl ? (editLabel ?? label) : label}
						aria-describedby={[hintId, error ? errorId : null].filter(Boolean).join(' ')}
						onClick={() => inputRef.current?.click()}
					/>
					<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2">
						{previewUrl ? (
							<span className="border-primary size-40 overflow-hidden rounded-full border-2">
								{/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
								<img src={previewUrl} alt="" width={160} height={160} className="size-full rounded-full object-cover" />
							</span>
						) : (
							<>
								<span className="bg-muted text-muted-foreground flex size-40 items-center justify-center rounded-full">
									<Camera className="size-10" aria-hidden />
								</span>
								<span className="text-muted-foreground text-sm">{uploadLabel}</span>
							</>
						)}
					</div>
					{previewUrl ? (
						<button
							type="button"
							disabled={disabled}
							className="bg-background text-foreground hover:bg-muted absolute top-2 right-2 flex size-8 items-center justify-center rounded-full border shadow-xs disabled:pointer-events-none disabled:opacity-50"
							aria-label={removeLabel}
							onClick={() => onChange(null)}
						>
							<Trash2 className="size-3.5" aria-hidden />
						</button>
					) : null}
				</div>
			) : previewUrl ? (
				<div className="border-border relative aspect-[16/10] w-full overflow-hidden rounded-2xl border">
					{/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
					<img src={previewUrl} alt="" className="size-full object-cover" />
					<button
						type="button"
						disabled={disabled}
						className="bg-background text-foreground hover:bg-muted absolute top-2 right-2 flex size-8 items-center justify-center rounded-full border shadow-xs disabled:pointer-events-none disabled:opacity-50"
						aria-label={removeLabel}
						onClick={() => onChange(null)}
					>
						<Trash2 className="size-3.5" aria-hidden />
					</button>
				</div>
			) : (
				<button
					type="button"
					disabled={disabled}
					className="border-border text-muted-foreground hover:bg-muted/40 flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed disabled:pointer-events-none disabled:opacity-50"
					aria-label={label}
					aria-describedby={[hintId, error ? errorId : null].filter(Boolean).join(' ')}
					onClick={() => inputRef.current?.click()}
				>
					<Upload className="size-6" aria-hidden />
					<span className="text-sm">{uploadLabel}</span>
				</button>
			)}
			<input
				ref={inputRef}
				type="file"
				accept={campaignSubmissionConfig.permittedImageMimeTypes.join(',')}
				className="sr-only"
				tabIndex={-1}
				disabled={disabled}
				onChange={(event) => {
					onChange(event.target.files?.[0] ?? null);
				}}
			/>
			<p id={hintId} className="text-muted-foreground text-xs">
				{hint}
			</p>
			{error ? (
				<p id={errorId} ref={errorRef} className="text-destructive text-sm outline-none" role="alert" tabIndex={-1}>
					{error}
				</p>
			) : null}
		</div>
	);
};
