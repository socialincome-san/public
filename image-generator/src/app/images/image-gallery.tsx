'use client';

import { Button } from '@socialincome/design-system/actions/button/button';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@socialincome/design-system/data-display/accordion/accordion';
import { Badge } from '@socialincome/design-system/data-display/badge/badge';
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@socialincome/design-system/overlays/dialog/dialog';
import { Check, Copy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { STYLE_TEMPLATE } from '../style-template';

const CopyButton = ({ text, label }: { text: string; label: string }) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = (e: React.MouseEvent) => {
		e.stopPropagation();
		void navigator.clipboard.writeText(text).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		});
	};

	return (
		<Button
			type="button"
			size="sm"
			variant="ghost"
			onClick={handleCopy}
			aria-label={copied ? `${label} kopiert` : `${label} kopieren`}
			title={copied ? 'Kopiert!' : 'Kopieren'}
		>
			{copied ? (
				<>
					<Check className="text-confirm size-3.5" />
					<span className="text-xs">Kopiert</span>
				</>
			) : (
				<>
					<Copy className="size-3.5" />
					<span className="text-xs">Kopieren</span>
				</>
			)}
		</Button>
	);
};

export type GalleryImage = {
	prompt: string | null;
	image_base64: string;
	media_type: string;
};

type ImageGalleryProps = {
	images: GalleryImage[];
};

export const ImageGallery = ({ images }: ImageGalleryProps) => {
	const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

	const splitPrompt = (fullPrompt: string | null) => {
		if (!fullPrompt) {
			return {
				normalPrompt: 'Kein Prompt hinterlegt.',
				basePrompt: STYLE_TEMPLATE,
			};
		}

		if (fullPrompt.startsWith(STYLE_TEMPLATE)) {
			return {
				normalPrompt: fullPrompt.slice(STYLE_TEMPLATE.length).trim() || 'Kein Benutzer-Prompt.',
				basePrompt: STYLE_TEMPLATE,
			};
		}

		return {
			normalPrompt: fullPrompt,
			basePrompt: STYLE_TEMPLATE,
		};
	};

	const handleDownload = (img: GalleryImage) => {
		const link = document.createElement('a');
		link.href = `data:${img.media_type};base64,${img.image_base64}`;
		link.download = 'generated-image.png';
		document.body.append(link);
		link.click();
		link.remove();
	};

	const { normalPrompt, basePrompt } = splitPrompt(selectedImage?.prompt ?? null);

	if (images.length === 0) {
		return (
			<div className="border-border bg-card flex flex-col items-center justify-center rounded-3xl border p-12 text-center sm:p-16">
				<Badge variant="outline" size="default">
					Galerie leer
				</Badge>
				<h2 className="text-primary mt-4 text-xl font-semibold tracking-tight sm:text-2xl">
					Noch keine Bilder generiert
				</h2>
				<p className="text-muted-foreground mt-2 max-w-md text-sm sm:text-base">
					Erstelle dein erstes KI-generiertes Bild im Social-Income-Stil mit einem Klick auf den Generator.
				</p>
				<div className="mt-6">
					<Button asChild size="default">
						<Link href="/">Zum Image Generator →</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{images.map((image, index) => {
					const { normalPrompt: previewPrompt } = splitPrompt(image.prompt);

					return (
						<button
							key={image.image_base64.slice(0, 32) + index}
							type="button"
							onClick={() => setSelectedImage(image)}
							className="group border-border bg-card hover:border-input hover:shadow-card focus-visible:ring-ring flex flex-col overflow-hidden rounded-2xl border text-left transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:outline-hidden"
						>
							<div className="bg-muted/40 aspect-video w-full overflow-hidden">
								<Image
									src={`data:${image.media_type};base64,${image.image_base64}`}
									width={640}
									height={360}
									alt={previewPrompt}
									className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
									unoptimized
								/>
							</div>
							<div className="p-4">
								<p className="text-foreground line-clamp-2 text-sm font-medium">{previewPrompt}</p>
								<span className="text-muted-foreground mt-2 inline-block text-xs group-hover:underline">
									Details & Prompts ansehen →
								</span>
							</div>
						</button>
					);
				})}
			</div>

			<Dialog open={selectedImage !== null} onOpenChange={(open) => !open && setSelectedImage(null)}>
				{selectedImage && (
					<DialogContent size="lg">
						<DialogHeader>
							<DialogTitle>Bilddetails & Prompts</DialogTitle>
						</DialogHeader>

						<DialogBody>
							<div className="space-y-6 py-2">
								<div className="bg-muted/30 border-border overflow-hidden rounded-2xl border">
									<Image
										src={`data:${selectedImage.media_type};base64,${selectedImage.image_base64}`}
										width={1920}
										height={1080}
										alt={normalPrompt}
										className="h-auto max-h-[50vh] w-full object-contain"
										unoptimized
									/>
								</div>

								<Accordion type="multiple" defaultValue={['prompt']}>
									<AccordionItem value="prompt">
										<AccordionTrigger>
										<div className="flex items-center gap-2.5">
											<span className="text-foreground text-sm font-bold tracking-tight">User Prompt</span>
										</div>
										</AccordionTrigger>
										<AccordionContent>
											<div className="border-input bg-card relative w-full rounded-2xl border p-4">
												<div className="absolute top-2.5 right-2.5">
													<CopyButton text={normalPrompt} label="User Prompt" />
												</div>
												<div className="text-foreground text-sm leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-wrap pr-24">
													{normalPrompt}
												</div>
											</div>
										</AccordionContent>
									</AccordionItem>

									<AccordionItem value="base-prompt">
										<AccordionTrigger>
										<div className="flex items-center gap-2.5">
											<span className="text-foreground text-sm font-bold tracking-tight">Base Prompt</span>
										</div>
										</AccordionTrigger>
										<AccordionContent>
											<div className="border-input bg-card relative w-full rounded-2xl border p-4">
												<div className="absolute top-2.5 right-2.5">
													<CopyButton text={basePrompt} label="Base Prompt" />
												</div>
												<div className="text-foreground text-sm leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-wrap pr-24">
													{basePrompt}
												</div>
											</div>
										</AccordionContent>
									</AccordionItem>
								</Accordion>
							</div>
						</DialogBody>

						<DialogFooter>
							<Button variant="outline" size="md" onClick={() => setSelectedImage(null)}>
								Schliessen
							</Button>
							<Button size="md" onClick={() => handleDownload(selectedImage)}>
								Download PNG
							</Button>
						</DialogFooter>
					</DialogContent>
				)}
			</Dialog>
		</>
	);
};
