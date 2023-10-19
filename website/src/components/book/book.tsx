import { Badge, BaseContainer, Typography } from '@socialincome/ui';
import classNames from 'classnames';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';

type BookProps = {
	cover: StaticImageData;
	author: string;
	authorLink: string;
	title: string;
	description: string;
	quote: string;
	publisher: string;
	publisherLink: string;
	year: string;
	currentlyReading?: boolean;
};

export default async function Book({
	cover,
	author,
	authorLink,
	title,
	description,
	quote,
	publisher,
	publisherLink,
	year,
	currentlyReading,
}: BookProps) {
	return (
		<BaseContainer>
			<div
				className={classNames('flex h-fit flex-col flex-nowrap pb-5 shadow-md sm:flex-row ', {
					'my-40': currentlyReading,
					'my-8': !currentlyReading,
				})}
			>
				<div className="w-fit basis-1/3">
					<Image src={cover} height={4000} alt="book cover" />
				</div>
				<div className="mx-8 flex w-fit basis-5/12 flex-col">
					<div className="flex flex-col items-baseline sm:flex-row">
						<Typography className="mt-6 text-blue-500 sm:mb-2">{author}</Typography>
						{currentlyReading && (
							<Badge className="my-1 rounded-md bg-blue-500 px-2 py-0.5 text-white sm:mx-1">Currently reading</Badge>
						)}
					</div>
					<Link href={authorLink}>
						<Typography weight="bold" size="xl" lineHeight="relaxed" className="mb-1">
							{title}
						</Typography>
					</Link>
					<Typography as="p">{description}</Typography>
					<Typography as="p" className="my-5">
						{quote}
					</Typography>
					<Link href={publisherLink}>
						<Typography weight="bold" className="hover:text-blue-800">
							{publisher}
						</Typography>
					</Link>
					<Typography size="sm">Published {year}</Typography>
				</div>
			</div>
		</BaseContainer>
	);
}
