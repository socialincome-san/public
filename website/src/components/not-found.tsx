import { FallbackPage } from '@/components/fallback-page';

type NotFoundProps = {
	title?: string;
	description?: string;
	children?: React.ReactNode;
};

export const NotFound = ({
	title = 'Page not found',
	description = "Looks like you've ventured into the unknown digital realm.",
	children,
}: NotFoundProps) => {
	return (
		<FallbackPage eyebrow="404" title={title} description={description}>
			{children}
		</FallbackPage>
	);
};
