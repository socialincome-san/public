'use client';

import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { type Ref, useEffect, useId, useRef, useState } from 'react';
import { cn } from '../../../cn';

type ImageUploadProps = {
	name: string;
	acceptedTypes: string[];
	maxSizeBytes: number;
	label: string;
	optionalLabel: string;
	dropLabel: string;
	browseLabel: string;
	previewLabel: string;
	removeLabel: string;
	helperText: string;
	invalidFileMessage: string;
	disabled?: boolean;
	variant?: 'dropzone' | 'attachment';
	inputRef?: Ref<HTMLInputElement>;
};

export const ImageUpload = ({
	name,
	acceptedTypes,
	maxSizeBytes,
	label,
	optionalLabel,
	dropLabel,
	browseLabel,
	previewLabel,
	removeLabel,
	helperText,
	invalidFileMessage,
	disabled,
	variant = 'dropzone',
	inputRef: externalInputRef,
}: ImageUploadProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const descriptionId = useId();
	const inputId = useId();
	const [preview, setPreview] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (preview) return () => URL.revokeObjectURL(preview);
	}, [preview]);

	return (
		<div className={cn('flex min-w-0 flex-col', (variant === 'dropzone' || preview || error) && 'gap-2')}>
			<label htmlFor={inputId} className={cn('text-primary text-sm font-semibold', variant === 'attachment' && 'sr-only')}>
				{label} <span className="text-muted-foreground font-normal">{optionalLabel}</span>
			</label>
			<div
				className={cn(
					variant === 'dropzone' &&
						'border-border focus-within:border-ring focus-within:ring-ring/50 relative flex h-20 items-center justify-center rounded-2xl border border-dashed py-3 pr-3 pl-20 focus-within:ring-2',
					variant === 'attachment' && (preview ? 'relative h-20 w-20' : 'hidden'),
				)}
			>
				<input
					id={inputId}
					ref={(node) => {
						inputRef.current = node;
						if (typeof externalInputRef === 'function') return externalInputRef(node);
						if (externalInputRef) externalInputRef.current = node;
					}}
					type="file"
					name={name}
					accept={acceptedTypes.join(',')}
					aria-label={label}
					disabled={disabled}
					aria-describedby={descriptionId}
					className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
					onChange={(event) => {
						const selected = event.currentTarget.files?.[0];

						if (!selected) return;
						if (!acceptedTypes.includes(selected.type) || selected.size > maxSizeBytes || selected.size === 0) {
							event.currentTarget.value = '';
							setPreview(null);
							setError(invalidFileMessage);

							return;
						}
						setPreview(URL.createObjectURL(selected));
						setError(null);
					}}
				/>
				{preview && (
					<div className="absolute top-1/2 left-3 size-14 -translate-y-1/2">
						<div className="border-border bg-card relative size-full overflow-hidden rounded-lg border">
							<Image src={preview} alt={previewLabel} fill sizes="56px" className="object-contain" unoptimized />
						</div>
						<div className="absolute -top-2 -right-2 z-20">
							<button
								type="button"
								className="border-input bg-background text-primary hover:bg-accent focus-visible:ring-ring flex size-6 items-center justify-center rounded-full border shadow-xs focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
								aria-label={removeLabel}
								disabled={disabled}
								onClick={() => {
									if (inputRef.current) inputRef.current.value = '';
									setPreview(null);
									setError(null);
								}}
							>
								<X aria-hidden="true" className="size-3" />
							</button>
						</div>
					</div>
				)}
				<div
					className={cn(
						'pointer-events-none flex min-w-0 flex-col items-center gap-1 text-center',
						variant === 'attachment' && 'sr-only',
					)}
				>
					{!preview && (
						<Upload aria-hidden="true" className="text-muted-foreground absolute top-1/2 left-4 size-5 -translate-y-1/2" />
					)}
					<p className="text-muted-foreground text-sm">
						<span className="hidden min-[360px]:inline">{dropLabel} </span>
						<span className="text-primary underline underline-offset-2">{browseLabel}</span>
					</p>
					<p id={descriptionId} className="text-muted-foreground sr-only text-xs min-[360px]:not-sr-only">
						{helperText}
					</p>
				</div>
			</div>
			{error && (
				<p className="text-destructive text-xs" role="alert">
					{error}
				</p>
			)}
		</div>
	);
};
