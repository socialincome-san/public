'use client';

import { COUNTRIES, DEFAULT_COUNTRY } from '@/lib/countries';
import { DEFAULT_IMAGE_FORMAT, IMAGE_FORMATS } from '@/lib/image-formats';
import { imageUrl, type SavedImage } from '@/lib/images';
import { MAX_REFERENCE_IMAGE_BYTES, REFERENCE_IMAGE_TYPES } from '@/lib/reference-image';
import { AddMenu } from '@socialincome/design-system/actions/add-menu/add-menu';
import { Button } from '@socialincome/design-system/actions/button/button';
import { AnimatedSILogoIcon } from '@socialincome/design-system/brand/logo/logo';
import { AspectRatioSelect } from '@socialincome/design-system/forms/aspect-ratio-select/aspect-ratio-select';
import { ImageUpload } from '@socialincome/design-system/forms/image-upload/image-upload';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@socialincome/design-system/forms/select/select';
import { Textarea } from '@socialincome/design-system/forms/textarea/textarea';
import { DropdownMenuItem } from '@socialincome/design-system/overlays/dropdown-menu/dropdown-menu';
import { Upload } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { type FormEvent, type KeyboardEvent, type ReactNode, useRef, useState, useTransition } from 'react';
import { DownloadMenu } from './download-menu';
import { ImageEditDialog } from './image-edit-dialog';
import { requestImage } from './request-image';

export const GeneratorForm = ({ children }: { children: ReactNode }) => {
	const referenceInputRef = useRef<HTMLInputElement>(null);
	const [prompt, setPrompt] = useState('');
	const [aspectRatio, setAspectRatio] = useState<string>(DEFAULT_IMAGE_FORMAT.value);
	const [country, setCountry] = useState<string>(DEFAULT_COUNTRY.value);
	// The generated image followed by every version made in the edit dialog; the latest one is shown.
	const [versions, setVersions] = useState<SavedImage[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const canSubmit = !isPending && prompt.trim() !== '';
	const [generated] = versions;
	const image = versions.at(-1);

	const generate = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!canSubmit) return;
		const formData = new FormData(event.currentTarget);
		startTransition(async () => {
			const result = await requestImage('/api/generate-image', formData);
			if ('error' in result) {
				setError(result.error);
				return;
			}
			setError(null);
			setVersions([result.image]);
		});
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
			event.preventDefault();
			event.currentTarget.form?.requestSubmit();
		}
	};

	return (
		<div className="flex flex-1 flex-col justify-between">
			<div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center sm:py-16">
				{!image && !isPending && children}

				{isPending && (
					<div className="flex flex-col items-center gap-5 text-center">
						<div className="text-primary flex items-center justify-center">
							<AnimatedSILogoIcon width={84} height={48} />
						</div>
						<p className="text-muted-foreground text-sm font-medium sm:text-base">
							Generating your watercolor image. This may take up to a minute ...
						</p>
					</div>
				)}

				{generated && image && !isPending && (
					<div className="flex flex-col items-center gap-6">
						<Image
							src={imageUrl(image.id, 'original')}
							width={image.width}
							height={image.height}
							alt="Generated"
							unoptimized
							className="border-input shadow-card max-h-[55vh] w-auto max-w-full rounded-3xl border object-contain"
						/>
						<div className="flex flex-wrap items-center justify-center gap-3">
							<DownloadMenu imageId={image.id} variant="default" size="md" />
							<ImageEditDialog
								key={generated.id}
								imageId={generated.id}
								size="md"
								onEdited={(edited) => setVersions((previous) => [...previous, edited])}
							/>
							<Button asChild variant="outline" size="md">
								<Link href="/images">View in gallery →</Link>
							</Button>
						</div>
					</div>
				)}
			</div>

			<div className="mx-auto w-full max-w-5xl px-4 pt-4 pb-8">
				<form onSubmit={generate} className="flex w-full flex-col gap-6">
					<div className="border-input bg-card/95 shadow-raised flex flex-col gap-2 rounded-3xl border px-4 py-3 backdrop-blur-md">
						<ImageUpload
							variant="attachment"
							inputRef={referenceInputRef}
							name="referenceImage"
							acceptedTypes={REFERENCE_IMAGE_TYPES}
							maxSizeBytes={MAX_REFERENCE_IMAGE_BYTES}
							label="Reference image"
							optionalLabel="(optional)"
							dropLabel="Drag and drop an image here or"
							browseLabel="browse"
							previewLabel="Selected reference image"
							removeLabel="Remove reference image"
							helperText="JPEG, PNG or WebP · up to 10 MB"
							invalidFileMessage="Choose a JPEG, PNG or WebP image up to 10 MB."
							disabled={isPending}
						/>
						<div className="w-full py-1">
							<Textarea
								variant="bare"
								resize="none"
								name="prompt"
								aria-label="Describe your image"
								required
								value={prompt}
								onChange={(e) => setPrompt(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder="Describe your image ..."
								rows={1}
							/>
						</div>
						<div className="flex w-full flex-wrap items-center justify-between gap-2">
							<div className="flex flex-wrap items-center gap-2">
								<AddMenu label="Add attachment" disabled={isPending}>
									<DropdownMenuItem onSelect={() => referenceInputRef.current?.click()}>
										<Upload aria-hidden="true" />
										Upload Reference Image
									</DropdownMenuItem>
								</AddMenu>
								{/* Wrappers size the full-width triggers to their content so the row can wrap on phones. */}
								<div>
									<AspectRatioSelect
										items={IMAGE_FORMATS}
										label="Image format"
										name="aspectRatio"
										value={aspectRatio}
										onValueChange={setAspectRatio}
										disabled={isPending}
									/>
								</div>
								<div>
									<Select name="country" value={country} onValueChange={setCountry} disabled={isPending}>
										<SelectTrigger size="sm" aria-label="Country">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{COUNTRIES.map((item) => (
												<SelectItem key={item.value} value={item.value}>
													{item.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
							<Button type="submit" size="md" disabled={!canSubmit}>
								<span>Generate</span>
								<span aria-hidden="true">→</span>
							</Button>
						</div>
					</div>
				</form>

				{error && !isPending && (
					<p className="text-destructive mt-2 text-center text-xs font-medium" role="alert">
						{error}
					</p>
				)}
			</div>
		</div>
	);
};
