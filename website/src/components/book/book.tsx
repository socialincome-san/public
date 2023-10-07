import { BaseContainer, Typography } from '@socialincome/ui';
import Image, { StaticImageData } from 'next/image';

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
	let baseClass = currentlyReading
		? 'flex flex-nowrap flex-col sm:flex-row pb-5 h-fit shadow-md my-40'
		: 'flex flex-nowrap flex-col sm:flex-row pb-5 h-fit shadow-md my-8 ';

	return (
		<BaseContainer>
			<div className={baseClass}>
				<div className="w-fit basis-1/3">
					<Image src={cover} height={4000} alt="book cover" />
				</div>
				<div className="mx-8 flex w-fit basis-5/12 flex-col">
					<div className="flex flex-col items-baseline sm:flex-row">
						<Typography as="div" className="mt-6 text-blue-500 sm:mb-2">
							{author}
						</Typography>
						{currentlyReading ? (
							<Typography
								as="span"
								size="xs"
								weight="bold"
								className="my-1 rounded-md bg-blue-500 px-2 py-0.5 text-white sm:mx-1"
							>
								Currently reading
							</Typography>
						) : (
							<></>
						)}
					</div>
					<Typography as="div" weight="bold" size="xl" lineHeight="relaxed" className="mb-1">
						<a href={authorLink}>{title}</a>
					</Typography>
					<Typography as="p">{description}</Typography>
					<Typography as="p" className="my-5">
						{quote}
					</Typography>
					<Typography as="div" weight="bold">
						<a href={publisherLink} className="hover:text-blue-800">
							{publisher}
						</a>
					</Typography>
					<Typography as="div" size="sm">
						Published {year}
					</Typography>
				</div>
			</div>
		</BaseContainer>
	);
}
