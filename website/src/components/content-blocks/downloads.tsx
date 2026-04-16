import { BlockWrapper } from '@/components/block-wrapper';
import type { Downloads } from '@/generated/storyblok/types/109655/storyblok-components';
import { StoryblokMultilink } from '@/generated/storyblok/types/storyblok';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import Link from 'next/link';
import Markdown from 'react-markdown';

type Props = {
	blok: Downloads;
	lang: WebsiteLanguage;
};

const getFileHref = (file: StoryblokMultilink) => {
	return file.url || file.cached_url || '#';
};

export const DownloadsBlock = async ({ blok, lang }: Props) => {
	if (!blok.files?.length) {
		return null;
	}
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-reporting'],
	});

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			<div className="space-y-6">
				{blok.heading && (
					<h2 className="text-4xl xl:text-5xl [&_strong]:font-bold">
						<Markdown components={{ p: ({ children }) => <>{children}</> }}>{blok.heading}</Markdown>
					</h2>
				)}
				<div className="overflow-hidden rounded-md border border-gray-200">
					<div className="hidden grid-cols-[minmax(0,1fr)_auto_auto] gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium md:grid">
						<div>{translator.t('table-columns.title')}</div>
						<div>{translator.t('table-columns.language')}</div>
						<div className="justify-self-end">{translator.t('table-columns.href')}</div>
					</div>
					<div className="divide-y divide-gray-200">
						{blok.files.map((download) => (
							<div
								key={download._uid}
								className="grid grid-cols-2 gap-2 px-4 py-4 text-sm md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center md:gap-4 md:py-3"
							>
								<div className="col-span-2 md:col-span-1">
									<p className="font-medium">{download.title}</p>
								</div>
								<div className="text-gray-600 md:text-gray-900">
									<p>{download.language || '-'}</p>
								</div>
								<div className="justify-self-end">
									<Link
										href={getFileHref(download.file)}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary underline"
									>
										{translator.t('download-pdf')}
									</Link>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</BlockWrapper>
	);
};
