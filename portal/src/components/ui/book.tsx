import { Badge, Card, Typography } from '@socialincome/ui';
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
		<Card className="flex flex-col sm:flex-row">
			<div className="w-fit basis-2/5 self-center">
				<Image src={cover} alt="Book cover" className="w-full rounded-sm" />
			</div>
			<div className="flex w-fit basis-3/5 flex-col px-8 py-6">
				<div className="flex-inline mb-1 flex items-center">
					<Typography as="h3" color="primary">
						{author}
					</Typography>
					{currentlyReading && <Badge className="ml-2 rounded-md">Currently reading</Badge>}
				</div>
				<Link href={authorLink} target="_blank" rel="noreferrer" className="mb-2">
					<Typography weight="bold" size="xl" lineHeight="relaxed" as="h2" className="hover:text-primary">
						{title}
					</Typography>
				</Link>
				<Typography>{description}</Typography>
				<Typography className="my-5">{quote}</Typography>
				<Link href={publisherLink} target="_blank" rel="noreferrer">
					<Typography weight="bold" className="hover:text-primary">
						{publisher}
					</Typography>
				</Link>
				<Typography size="sm">Published {year}</Typography>
			</div>
		</Card>
	);
}
