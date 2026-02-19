import NextLink from 'next/link';
import { MARK_LINK, NODE_HEADING, NODE_LI, render, StoryblokRichtext } from 'storyblok-rich-text-react-renderer';

type RichTextRendererProps = {
	richTextDocument: StoryblokRichtext;
};

export const RichTextRenderer = ({ richTextDocument }: RichTextRendererProps) => {
	return render(richTextDocument, {
		markResolvers: {
			[MARK_LINK]: (children: any, props: any) => (
				<NextLink href={props.href} className="font-normal underline">
					{children}
				</NextLink>
			),
		},
		nodeResolvers: {
			[NODE_HEADING]: (children, { level }) => {
				// Todo: Probably move those to separate heading components
				const Tag = `h${level}` as const;
				const styles: Record<number, string> = {
					1: 'text-4xl font-bold',
					2: 'text-3xl font-bold',
					3: 'text-2xl font-semibold',
					4: 'text-xl font-semibold',
					5: 'text-lg font-medium',
					6: 'text-base font-medium',
				};
				return <Tag className={styles[level]}>{children}</Tag>;
			},
			[NODE_LI]: (children) => <li className="m-0.5 p-0.5 [&::marker]:text-black [&>*]:m-0 [&>*]:p-0">{children}</li>,
		},
		blokResolvers: {
			// Todo: Add blocks as soon as we have them ready in the Storyblok schema
		},
	});
}
