import type { QuotedText as QuotedTextBlok } from '@/generated/storyblok/types/109655/storyblok-components';

type Props = QuotedTextBlok;

export const QuotedText = ({ text, author, authorTitle }: Props) => {
	return (
		<figure className="border-border my-8 rounded-2xl border bg-white p-6">
			<blockquote className="text-foreground text-lg leading-relaxed font-medium">“{text}”</blockquote>
			{author ? (
				<figcaption className="text-muted-foreground mt-4 text-sm">
					<span className="font-semibold">{author}</span>
					{authorTitle ? <span>{` · ${authorTitle}`}</span> : null}
				</figcaption>
			) : null}
		</figure>
	);
};
