type PageIntroProps = {
	title?: string;
	description?: string;
};

export const PageIntro = ({ title, description }: PageIntroProps) => {
	const trimmedTitle = title?.trim();
	const trimmedDescription = description?.trim();

	if (!trimmedTitle && !trimmedDescription) {
		return null;
	}

	return (
		<div className="space-y-5">
			{trimmedTitle ? (
				<h1 className="text-foreground text-5xl leading-tight font-bold md:text-6xl">{trimmedTitle}</h1>
			) : null}
			{trimmedDescription ? (
				<p className="text-foreground max-w-2xl text-base leading-6 sm:text-lg sm:leading-7">{trimmedDescription}</p>
			) : null}
		</div>
	);
};
