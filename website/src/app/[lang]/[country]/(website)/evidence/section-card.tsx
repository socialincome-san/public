import { DefaultParams } from '@/app/[lang]/[country]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import {
	Button,
	Card,
	CardTitle,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Typography,
} from '@socialincome/ui';
import Link from 'next/link';
import { SectionParagraph } from './section-paragraph';

type SectionCardProps = {
	section: number;
	cardNumber: number;
	params: DefaultParams;
};

export async function SectionCard({ section, cardNumber, params }: SectionCardProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-evidence'],
	});

	const p = translator.t(`section-${section}.cards.card-${cardNumber}.paragraphs`, { returnObjects: true });
	let paragraphs: Object[] = [];
	for (const paragraph in p) {
		paragraphs.push(paragraph);
	}
	let i = 0;

	return (
		<Dialog>
			<DialogTrigger>
				<Card className="w-full scale-100 border border-black bg-inherit px-10 py-4 text-left duration-200 ease-in hover:scale-105">
					<CardTitle className="py-2 text-red-400 ">
						{translator.t(`section-${section}.cards.card-${cardNumber}.title`)}
					</CardTitle>
					<Typography size="lg">{translator.t(`section-${section}.cards.card-${cardNumber}.description`)}</Typography>
				</Card>
			</DialogTrigger>
			<DialogContent className="w-full">
				<DialogHeader>
					<DialogTitle>
						<Typography size="2xl" weight="bold">
							{translator.t(`section-${section}.cards.card-${cardNumber}.title`)}
						</Typography>
					</DialogTitle>
				</DialogHeader>
				<DialogDescription>
					{paragraphs.map((paragraph, key) => {
						i++;
						return (
							<div className="mb-3">
								<SectionParagraph
									section={section}
									cardNumber={cardNumber}
									paragraphNumber={i}
									params={params}
									key={key}
								/>
							</div>
						);
					})}
					<br />
				</DialogDescription>
				<DialogFooter>
					<Link href="/get-involved">
						<Button>{translator.t('take-action')}</Button>
					</Link>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
