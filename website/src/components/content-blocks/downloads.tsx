import { BlockWrapper } from '@/components/block-wrapper';
import { Button } from '@/components/button';
import { SectionHeading } from '@/components/section-heading';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import type { Document, Downloads } from '@/generated/storyblok/types/109655/storyblok-components';
import type { StoryblokAsset } from '@/generated/storyblok/types/storyblok';
import type { ISbStoryData } from '@storyblok/js';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import { DownloadIcon } from 'lucide-react';
import Link from 'next/link';

type Props = {
	blok: Downloads;
};

const getFileHref = (file: StoryblokAsset) => {
	return file.filename ?? file.src ?? null;
};

const getDocumentContent = (document: ISbStoryData<Document> | string) => {
	return typeof document === 'string' ? null : document.content;
};

export const DownloadsBlock = ({ blok }: Props) => {
	if (!blok.documents.length) {
		return null;
	}

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<div className="space-y-6">
				{blok.heading && (
					<SectionHeading align="left" className="mb-0 md:mb-0">
						<StoryblokMarkdown>{blok.heading}</StoryblokMarkdown>
					</SectionHeading>
				)}
				<div className="overflow-hidden rounded-md border border-gray-200">
					<div className="hidden grid-cols-[minmax(0,1fr)_8rem_5rem] gap-12 border-b border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium md:grid">
						<div>{blok.tableHeaderLabelFilename}</div>
						<div>{blok.tableHeaderLabelInfo}</div>
						<div className="justify-self-end">{blok.tableHeaderLabelLink}</div>
					</div>
					<div className="divide-y divide-gray-200">
						{blok.documents.map((document) => {
							const content = getDocumentContent(document);
							if (!content) {
								return null;
							}

							const href = getFileHref(content.file);
							const downloadLabel = `Download ${content.title}`;

							return (
								<div
									key={typeof document === 'string' ? document : document.uuid}
									className="grid grid-cols-2 gap-2 px-4 py-4 text-sm md:grid-cols-[minmax(0,1fr)_8rem_5rem] md:items-center md:gap-12 md:py-3"
								>
									<div className="col-span-2 md:col-span-1">
										<p className="font-medium">{content.title}</p>
									</div>
									<div className="text-gray-600 md:text-gray-900">
										<p>{content.language ?? '-'}</p>
									</div>
									<div className="justify-self-end">
										{href ? (
											<Button variant="outline" size="icon" asChild>
												<Link href={href} target="_blank" rel="noopener noreferrer" aria-label={downloadLabel}>
													<DownloadIcon />
												</Link>
											</Button>
										) : (
											<Button variant="outline" size="icon" disabled aria-label={downloadLabel}>
												<DownloadIcon />
											</Button>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</BlockWrapper>
	);
};
