type Props = {
	title?: string;
	text?: string;
};

export const CmsHeader = ({ title, text }: Props) => {
	const normalizedTitle = title?.trim();
	const normalizedText = text?.trim();

	if (!normalizedTitle && !normalizedText) {
		return null;
	}

	return (
		<div className="space-y-5">
			{normalizedTitle ? (
				<h1 className="text-foreground text-4xl leading-tight font-bold sm:text-5xl">{normalizedTitle}</h1>
			) : null}
			{normalizedText ? (
				<p className="text-foreground text-base leading-6 sm:text-lg sm:leading-7">{normalizedText}</p>
			) : null}
		</div>
	);
};
