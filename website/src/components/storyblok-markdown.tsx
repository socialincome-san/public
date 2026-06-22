import Markdown from 'react-markdown';

type Props = {
	children: string;
};

export const StoryblokMarkdown = ({ children }: Props) => (
	<Markdown components={{ p: ({ children: paragraphChildren }) => <>{paragraphChildren}</> }}>{children}</Markdown>
);
