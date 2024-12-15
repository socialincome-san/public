import { Badge, Card, CardContent, CardHeader, CardTitle, Typography } from '@socialincome/ui';
import Image from 'next/image';
import Link from 'next/link';

type TechCardTranslations = {
	badgeDonated: string;
}

type TechCardProps = {
	title: string;
	description: string;
	link: string;
	logo: string;
	donated: boolean;
	translations: TechCardTranslations;
};

function getLogoSrc(logo: string) {
	const image_base_path = '/assets/tech/';
	return image_base_path.concat(logo);
}

export default function TechCard({ title, description, link, logo, donated, translations }: TechCardProps) {
	return (
		<Card className="hover:bg-primary max-w-lg rounded-lg p-6 shadow-none hover:bg-opacity-10">
			<Link href={link} target="_blank" rel="noreferrer" className="flex flex-col gap-6 sm:flex-row">
				{!!logo && (
					<div className="w-fit basis-1/4 self-center">
						<Image
							src={getLogoSrc(logo)}
							alt={title}
							className="mx-auto w-1/2 rounded-sm sm:w-full"
							width="48"
							height="48"
							unoptimized
						/>
					</div>
				)}
				<div className={'' + (!!logo ? 'w-fit basis-3/4' : '')}>
					{donated && (
						<Badge className="bg-accent hover:bg-accent text-primary text-md float-right -m-3 border-none">
							<Typography size="md" weight="normal" className="p-1">
								{translations.badgeDonated}
							</Typography>
						</Badge>
					)}
					<CardHeader className="p-0">
						<CardTitle className="flex items-center justify-between">
							<Typography size="2xl" weight="medium">
								{title}
							</Typography>
						</CardTitle>
					</CardHeader>
					<CardContent className="my-4 p-0">
						<Typography size="lg">{description}</Typography>
					</CardContent>
				</div>
			</Link>
		</Card>
	);
}
