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
				<h1 className="text-4xl leading-tight font-bold text-cyan-900 sm:text-5xl">{normalizedTitle}</h1>
			) : null}
			{normalizedText ? <p className="text-base leading-6 text-cyan-950 sm:text-lg sm:leading-7">{normalizedText}</p> : null}
		</div>
	);
};
