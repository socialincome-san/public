import { ArrowRightIcon, CheckIcon, DownloadIcon, FileTextIcon } from 'lucide-react';
import NextImage from 'next/image';
import NextLink from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { Button } from '../../actions/button/button';
import { AvatarStack } from '../avatar-stack/avatar-stack';
import { Card } from '../card/card';

type DocumentListGroupProps = {
	title: ReactNode;
	children: ReactNode;
	footer?: ReactNode;
};

export const DocumentListGroup = ({ title, children, footer }: DocumentListGroupProps) => (
	<Card padding="none" elevation="soft">
		<section>
			<h3 className="text-foreground bg-muted/40 border-border border-b px-4 py-4 text-2xl font-semibold sm:px-6 sm:py-5">
				{title}
			</h3>
			<ul>{children}</ul>
			{footer}
		</section>
	</Card>
);

type DocumentListGroupFooterProps = {
	message: ReactNode;
	linkLabel: string;
	linkHref: string;
};

export const DocumentListGroupFooter = ({ message, linkLabel, linkHref }: DocumentListGroupFooterProps) => (
	<div className="border-border text-muted-foreground flex flex-wrap items-center gap-1.5 border-t px-4 py-3.5 text-sm sm:px-6">
		<CheckIcon className="text-confirm size-3.5 shrink-0" aria-hidden />
		<p className="min-w-0 flex-1">{message}</p>
		<NextLink
			href={linkHref}
			className="text-foreground hover:text-primary focus-visible:ring-ring inline-flex basis-full items-center gap-1 rounded-sm pl-5 font-medium underline underline-offset-3 transition-colors focus-visible:ring-2 focus-visible:outline-none sm:ml-auto sm:basis-auto sm:pl-0"
		>
			{linkLabel}
			<ArrowRightIcon className="size-3.5" aria-hidden />
		</NextLink>
	</div>
);

type DocumentListAuthor = {
	name: string;
	// Shown instead of the full name when several authors don't fit on one line
	firstName: string;
	avatarSrc?: string;
	href?: string;
};

type DocumentListDownload = {
	label: string;
	href: string;
	ariaLabel: string;
	tooltip?: string;
};

type DocumentListItemProps = {
	title: string;
	thumbnailSrc?: string;
	/** Up to three authors */
	authors?: DocumentListAuthor[];
	note?: string;
	/** Marks the document with a tick, e.g. approved; the label is read out and shown on hover */
	checkLabel?: string;
	downloads: DocumentListDownload[];
};

const authorLinkClassName =
	'text-foreground focus-visible:ring-ring rounded-sm hover:underline focus-visible:ring-2 focus-visible:outline-none';

const AuthorName = ({ author, shorten }: { author: DocumentListAuthor; shorten: boolean }) =>
	shorten ? (
		<>
			<span className="@sm/document:hidden">{author.firstName}</span>
			<span className="hidden @sm/document:inline">{author.name}</span>
		</>
	) : (
		author.name
	);

export const DocumentListItem = ({
	title,
	thumbnailSrc,
	authors = [],
	note,
	checkLabel,
	downloads,
}: DocumentListItemProps) => {
	const visibleAuthors = authors.slice(0, 3);
	const shortenNames = visibleAuthors.length > 1;

	return (
		<li className="border-border hover:bg-muted/50 grid grid-cols-[3rem_minmax(0,1fr)] items-start gap-x-4 gap-y-3 border-t px-4 py-4 transition-colors first:border-t-0 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-center sm:px-6">
			<div className="bg-muted text-muted-foreground relative row-span-2 flex h-16 w-12 items-center justify-center overflow-hidden rounded-lg sm:row-span-1">
				{thumbnailSrc ? (
					<NextImage src={thumbnailSrc} alt="" fill sizes="48px" className="object-cover" />
				) : (
					<FileTextIcon className="size-5" aria-hidden />
				)}
			</div>
			<div className="@container/document min-w-0 space-y-1">
				<p className="text-foreground text-base font-medium">
					{title}
					{checkLabel ? (
						<span title={checkLabel} className="ml-1.5 inline-flex align-middle">
							<CheckIcon className="text-confirm size-3.5" aria-hidden />
							<span className="sr-only">{checkLabel}</span>
						</span>
					) : null}
				</p>
				{visibleAuthors.length > 0 || note ? (
					<div className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm">
						{visibleAuthors.length > 0 ? (
							<>
								<AvatarStack
									size="xs"
									people={visibleAuthors.map((author) => ({
										name: author.name,
										imageSrc: author.avatarSrc,
										href: author.href,
									}))}
								/>
								<span className="text-foreground">
									{visibleAuthors.map((author, index) => (
										<Fragment key={author.name}>
											{index > 0 ? ', ' : null}
											{author.href ? (
												<NextLink href={author.href} className={authorLinkClassName}>
													<AuthorName author={author} shorten={shortenNames} />
												</NextLink>
											) : (
												<AuthorName author={author} shorten={shortenNames} />
											)}
										</Fragment>
									))}
								</span>
							</>
						) : null}
						{visibleAuthors.length > 0 && note ? (
							<span className="hidden sm:inline" aria-hidden>
								·
							</span>
						) : null}
						{note ? <span>{note}</span> : null}
					</div>
				) : null}
			</div>
			<div className="col-start-2 flex flex-wrap gap-2 sm:col-start-auto sm:justify-end">
				{downloads.map((download) => (
					<Button key={download.href} variant="outline" size="sm" asChild>
						<NextLink
							href={download.href}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={download.ariaLabel}
							title={download.tooltip}
						>
							<DownloadIcon aria-hidden />
							{download.label}
						</NextLink>
					</Button>
				))}
			</div>
		</li>
	);
};

type DocumentListEmptyProps = {
	message: ReactNode;
};

export const DocumentListEmpty = ({ message }: DocumentListEmptyProps) => (
	<Card padding="compact" elevation="soft">
		<p className="text-muted-foreground text-center text-sm">{message}</p>
	</Card>
);
