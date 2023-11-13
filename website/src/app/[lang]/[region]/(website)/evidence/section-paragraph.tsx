import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Typography } from '@socialincome/ui';
import Link from 'next/link';

type SectionParagraphProps = {
	section: number;
	cardNumber: number;
	paragraphNumber: number;
	params: DefaultParams;
};

export async function SectionParagraph({ section, cardNumber, paragraphNumber, params }: SectionParagraphProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-evidence'],
	});
	const pt = translator.t(`section-${section}.cards.card-${cardNumber}.paragraphs.paragraph-${paragraphNumber}`, {
		returnObjects: true,
	});
	let parts: Object[] = [];
	for (const part in pt) {
		parts.push(part);
	}
	let i = 0;
	return (
		<div>
			{parts.map((part, key) => {
				i++;
				return (
					<span key={key}>
						<Typography as="span" size="lg">
							{translator.t(
								`section-${section}.cards.card-${cardNumber}.paragraphs.paragraph-${paragraphNumber}.part-${i}.text`,
							)}
						</Typography>
						<Link
							href={translator.t(
								`section-${section}.cards.card-${cardNumber}.paragraphs.paragraph-${paragraphNumber}.part-${i}.link`,
							)}
						>
							<Typography as="span" size="lg" className="text-blue-500 hover:text-blue-800">
								{translator.t(
									`section-${section}.cards.card-${cardNumber}.paragraphs.paragraph-${paragraphNumber}.part-${i}.text-blue`,
								)}
							</Typography>
						</Link>
					</span>
				);
			})}
		</div>
	);
}
