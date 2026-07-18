import type { QuotedText as QuotedTextBlok } from '@/generated/storyblok/types/109655/storyblok-components';

type Props = QuotedTextBlok;

export const QuotedText = ({ text, author, authorTitle }: Props) => {
	return (
		<figure className="my-8 rounded-2xl p-6 text-center">
			<blockquote className="text-foreground border-l-0 pl-0 text-2xl leading-relaxed font-medium not-italic">
				“{text}”
			</blockquote>
			{author ? (
				<figcaption className="text-foreground mt-4 text-lg">
					<span className="font-medium">{author}</span>
					{authorTitle ? <span>{` · ${authorTitle}`}</span> : null}
				</figcaption>
			) : null}
		</figure>
	);
};
