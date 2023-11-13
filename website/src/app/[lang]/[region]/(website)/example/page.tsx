import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import Link from 'next/link';

type TextFragment = {
	text: string;
	href?: string;
};
type Paragraph = TextFragment[];

export default async function Page({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-evidence'],
	});
	const paragraphs = translator.t<Paragraph[]>(`section-2.cards.card-1.paragraphs`);

	return (
		<BaseContainer>
			<Typography size="2xl">{translator.t('take-action')}</Typography>
			{paragraphs.map((paragraph, key) => (
				<p key={key} className="mt-2">
					{paragraph.map((fragment, key) => (
						<span key={key}>
							{fragment.href ? (
								<Link href={fragment.href}>
									<Typography as="span" color="primary">
										{fragment.text}
									</Typography>
								</Link>
							) : (
								<Typography as="span">{fragment.text}</Typography>
							)}
						</span>
					))}
				</p>
			))}
		</BaseContainer>
	);
}
