'use client';

import { DEFAULT_IMAGE_FORMAT, IMAGE_FORMATS } from '@/lib/image-formats';
import { isGenerateResponse } from '@/lib/images';
import { MAX_REFERENCE_IMAGE_BYTES, REFERENCE_IMAGE_TYPES } from '@/lib/reference-image';
import { AddMenu } from '@socialincome/design-system/actions/add-menu/add-menu';
import { Button } from '@socialincome/design-system/actions/button/button';
import { AnimatedSILogoIcon } from '@socialincome/design-system/brand/logo/logo';
import { AspectRatioSelect } from '@socialincome/design-system/forms/aspect-ratio-select/aspect-ratio-select';
import { ImageAreaEditor } from '@socialincome/design-system/forms/image-area-editor/image-area-editor';
import { ImageUpload } from '@socialincome/design-system/forms/image-upload/image-upload';
import { Textarea } from '@socialincome/design-system/forms/textarea/textarea';
import { ImageHistory } from '@socialincome/design-system/navigation/image-history/image-history';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@socialincome/design-system/overlays/dialog/dialog';
import { DropdownMenuItem } from '@socialincome/design-system/overlays/dropdown-menu/dropdown-menu';
import { Pencil, Plus, Upload } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { type KeyboardEvent, type ReactNode, useActionState, useRef, useState } from 'react';

type ImageVersion = { src: string; width: number; height: number; cost: number | null };
type GenerationState = { versions: ImageVersion[]; error: string | null };

const costFormatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 2,
	maximumFractionDigits: 6,
});

const generate = async (previous: GenerationState, formData: FormData): Promise<GenerationState> => {
	const prompt = formData.get('prompt');
	if ((typeof prompt !== 'string' || !prompt.trim()) && formData.get('editMode') !== 'remove') return previous;

	try {
		const response = await fetch('/api/generate-image', {
			method: 'POST',
			body: formData,
		});
		const json: unknown = await response.json();
		if (!isGenerateResponse(json)) {
			return { ...previous, error: 'Image generation failed. Please try again.' };
		}
		if (json.error) return { ...previous, error: json.error };
		if (!response.ok || !json.imageBase64 || !json.mediaType || !json.width || !json.height) {
			return { ...previous, error: 'Image generation failed. Please try again.' };
		}
		return {
			versions: [
				...previous.versions,
				{
					src: `data:${json.mediaType};base64,${json.imageBase64}`,
					width: json.width,
					height: json.height,
					cost: json.cost,
				},
			],
			error: null,
		};
	} catch {
		return { ...previous, error: 'Image generation failed. Please try again.' };
	}
};

export const GeneratorForm = ({
	children,
	initialImage,
}: {
	children?: ReactNode;
	initialImage?: { src: string; width: number; height: number };
}) => {
	const referenceInputRef = useRef<HTMLInputElement>(null);
	const promptRef = useRef<HTMLTextAreaElement>(null);
	const [prompt, setPrompt] = useState('');
	const [edit, setEdit] = useState<{ active: boolean; mode: 'remove' | 'change'; mask: string | null } | null>(
		initialImage ? { active: true, mode: 'change', mask: null } : null,
	);
	const [aspectRatio, setAspectRatio] = useState<string>(DEFAULT_IMAGE_FORMAT.value);
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	const [homeDialogOpen, setHomeDialogOpen] = useState(false);
	const [{ versions, error }, formAction, isPending] = useActionState(
		async (previous: GenerationState, formData: FormData) => {
			try {
				const source = previous.versions[selectedIndex ?? previous.versions.length - 1];
				if (edit?.mask && source) {
					formData.set('editImage', await (await fetch(source.src)).blob(), 'image.png');
					formData.set('selectionMask', await (await fetch(edit.mask)).blob(), 'selection.png');
					formData.set('editMode', edit.mode);
					formData.delete('referenceImage');
				}
				const result = await generate(previous, formData);
				if (!result.error) {
					setEdit(null);
					setSelectedIndex(null);
				}
				return result;
			} catch {
				return { ...previous, error: 'Image editing failed. Please try again.' };
			}
		},
		{
			versions: initialImage ? [{ ...initialImage, cost: null }] : [],
			error: null,
		},
	);
	const activeIndex = selectedIndex ?? versions.length - 1;
	const activeVersion = versions[activeIndex];
	const imageSrc = activeVersion?.src;
	const width = activeVersion?.width ?? DEFAULT_IMAGE_FORMAT.width;
	const height = activeVersion?.height ?? DEFAULT_IMAGE_FORMAT.height;
	const hasSelection = Boolean(edit?.mask);
	const canSubmit = !isPending && !edit?.active && (prompt.trim() !== '' || (hasSelection && edit?.mode === 'remove'));

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
			event.preventDefault();
			if (canSubmit) event.currentTarget.form?.requestSubmit();
		}
	};

	return (
		<div className="flex flex-1 flex-col justify-between">
			<ImageHistory
				label="Version history"
				header={
					<Dialog open={homeDialogOpen} onOpenChange={setHomeDialogOpen}>
						<DialogTrigger asChild>
							<Button type="button" variant="ghost" size="sm" disabled={isPending}>
								<Plus aria-hidden="true" /> Home
							</Button>
						</DialogTrigger>
						<DialogContent size="alert" hideCloseButton>
							<DialogHeader divided={false}>
								<DialogTitle>Leave session?</DialogTitle>
								<DialogDescription>
									Your images are saved in the gallery, but your session history will be lost.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter divided={false}>
								<Button type="button" variant="outline" onClick={() => setHomeDialogOpen(false)}>
									Cancel
								</Button>
								{/* A document navigation clears session state even when already on the home route. */}
								<form action="/" method="get">
									<Button type="submit">Leave</Button>
								</form>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				}
				items={versions.map((version, index) => ({
					src: version.src,
					label: `Version ${index + 1}`,
					tooltip: version.cost === null ? 'Cost unavailable' : `Cost: ${costFormatter.format(version.cost)} USD`,
				}))}
				selectedIndex={activeIndex}
				disabled={isPending}
				onSelect={(index) => {
					if (index === activeIndex) return;
					setSelectedIndex(index);
					setEdit(null);
				}}
			>
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

					{imageSrc && (
						<div hidden={isPending} className={isPending ? 'hidden' : 'flex max-w-full flex-col items-center gap-6'}>
							<ImageAreaEditor
								key={activeIndex}
								width={width}
								height={height}
								active={Boolean(edit?.active)}
								mode={edit?.mode ?? 'change'}
								onModeChange={(mode) => setEdit((previous) => ({ active: true, mask: previous?.mask ?? null, mode }))}
								onSelectionChange={(mask) =>
									setEdit((previous) => ({ active: previous?.active ?? true, mode: previous?.mode ?? 'change', mask }))
								}
								onDone={() => {
									setEdit((previous) => previous && { ...previous, active: false });
									promptRef.current?.focus();
								}}
								onCancel={() => setEdit(null)}
								labels={{
									selection: 'Image area selection',
									remove: 'Mark to Remove',
									removeHelp: 'Remove selected objects.',
									change: 'Mark to Change',
									changeHelp: 'Change the selection with a prompt.',
									brush: 'Brush',
									brushHelp: 'Paint a selection.',
									eraser: 'Eraser',
									eraserHelp: 'Erase selection marks.',
									size: 'Size',
									undo: 'Undo',
									undoHelp: 'Undo last stroke.',
									redo: 'Redo',
									redoHelp: 'Restore undone stroke.',
									clear: 'Clear selection',
									clearHelp: 'Clear all selection marks.',
									done: 'Done',
									cancel: 'Cancel',
									help: 'Select the whole detail with a little surrounding area. Choose Done, then describe what to redraw or repair below.',
								}}
							>
								<Image
									src={imageSrc}
									width={width}
									height={height}
									alt="Generated"
									className="border-input shadow-card max-h-[55vh] w-auto max-w-full rounded-3xl border object-contain"
								/>
							</ImageAreaEditor>
							{!edit?.active && (
								<div className="flex flex-wrap items-center justify-center gap-3">
									<Button
										type="button"
										variant="outline"
										size="lg"
										aria-pressed={Boolean(edit?.active)}
										onClick={() => {
											if (!edit) setPrompt('');
											setEdit((previous) => ({
												active: true,
												mode: previous?.mode ?? 'change',
												mask: previous?.mask ?? null,
											}));
										}}
									>
										<Pencil aria-hidden="true" />
										Edit Area
									</Button>
									<Button asChild size="md">
										<a href={imageSrc} download="generated-image.png">
											Download PNG
										</a>
									</Button>
									<Button asChild variant="outline" size="md">
										<Link href="/images">View in gallery →</Link>
									</Button>
								</div>
							)}
						</div>
					)}
				</div>
			</ImageHistory>

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
								ref={promptRef}
								variant="bare"
								resize="none"
								name="prompt"
								aria-label="Describe your image"
								required={!(hasSelection && edit?.mode === 'remove')}
								value={prompt}
								onChange={(e) => setPrompt(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder={
									hasSelection
										? edit?.mode === 'remove'
											? 'Optional instructions for removing the selected area ...'
											: 'Describe changes to the selected area ...'
										: 'Describe your image ...'
								}
								rows={1}
							/>
						</div>
						<div className="flex w-full flex-wrap items-center justify-between gap-2">
							<div className="flex items-center gap-2">
								<AddMenu label="Add attachment" disabled={isPending}>
									<DropdownMenuItem onSelect={() => referenceInputRef.current?.click()}>
										<Upload aria-hidden="true" />
										Upload Reference Image
									</DropdownMenuItem>
								</AddMenu>
								<AspectRatioSelect
									items={IMAGE_FORMATS}
									label="Image format"
									name="aspectRatio"
									value={aspectRatio}
									onValueChange={setAspectRatio}
									disabled={isPending || hasSelection}
								/>
							</div>
							<Button type="submit" size="md" disabled={!canSubmit}>
								<span>
									{hasSelection ? (edit?.mode === 'remove' ? 'Remove selected area' : 'Apply changes') : 'Generate'}
								</span>
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
