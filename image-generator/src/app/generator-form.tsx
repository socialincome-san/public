'use client';

import { COUNTRIES, DEFAULT_COUNTRY } from '@/lib/countries';
import { DEFAULT_IMAGE_FORMAT, IMAGE_FORMATS } from '@/lib/image-formats';
import { type GalleryImage, isGenerateResponse } from '@/lib/images';
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
import { type KeyboardEvent, type ReactNode, useActionState, useRef, useState } from 'react';
import { DownloadButton } from './download-button';

type GenerationState = {
	imageId: GalleryImage['id'] | null;
	imageSrc: string | null;
	error: string | null;
	width: number;
	height: number;
};

const generate = async (previous: GenerationState, formData: FormData): Promise<GenerationState> => {
	const prompt = formData.get('prompt');
	if (typeof prompt !== 'string' || !prompt.trim()) return previous;

	try {
		const response = await fetch('/api/generate-image', {
			method: 'POST',
			body: formData,
		});
		const json: unknown = await response.json();
		if (!isGenerateResponse(json) || (!response.ok && !json.error)) {
			return { ...previous, error: 'Image generation failed. Please try again.' };
		}
		return {
			...previous,
			imageId: json.imageId,
			imageSrc: json.imageBase64 && json.mediaType ? `data:${json.mediaType};base64,${json.imageBase64}` : null,
			error: json.error,
			width: json.width ?? previous.width,
			height: json.height ?? previous.height,
		};
	} catch {
		return { ...previous, error: 'Image generation failed. Please try again.' };
	}
};

export const GeneratorForm = ({ children }: { children: ReactNode }) => {
	const referenceInputRef = useRef<HTMLInputElement>(null);
	const [prompt, setPrompt] = useState('');
	const [aspectRatio, setAspectRatio] = useState<string>(DEFAULT_IMAGE_FORMAT.value);
	const [country, setCountry] = useState<string>(DEFAULT_COUNTRY.value);
	const [{ imageId, imageSrc, error, width, height }, formAction, isPending] = useActionState(generate, {
		imageId: null,
		imageSrc: null,
		error: null,
		width: DEFAULT_IMAGE_FORMAT.width,
		height: DEFAULT_IMAGE_FORMAT.height,
	});

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
			event.preventDefault();
			if (!isPending && prompt.trim()) event.currentTarget.form?.requestSubmit();
		}
	};

	return (
		<div className="flex flex-1 flex-col justify-between">
			<div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center sm:py-16">
				{!imageSrc && !isPending && children}

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

				{imageSrc && !isPending && (
					<div className="flex flex-col items-center gap-6">
						<Image
							src={imageSrc}
							width={width}
							height={height}
							alt="Generated"
							className="border-input shadow-card max-h-[55vh] w-auto max-w-full rounded-3xl border object-contain"
						/>
						<div className="flex flex-wrap items-center justify-center gap-3">
							{imageId !== null && <DownloadButton imageId={imageId} label="Download PNG" variant="default" size="md" />}
							<Button asChild variant="outline" size="md">
								<Link href="/images">View in gallery →</Link>
							</Button>
						</div>
					</div>
				)}
			</div>

			<div className="mx-auto w-full max-w-5xl px-4 pt-4 pb-8">
				<form
					action={formAction}
					onResetCapture={(event) => {
						// React resets successful action forms; Radix would also reset the selected ratio.
						event.preventDefault();
						event.stopPropagation();
					}}
					className="flex w-full flex-col gap-6"
				>
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
							<Button type="submit" size="md" disabled={isPending || prompt.trim() === ''}>
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
