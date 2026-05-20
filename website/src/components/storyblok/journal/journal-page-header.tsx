type Props = {
	title: string;
	description?: string;
};

export const JournalPageHeader = ({ title, description }: Props) => (
	<div className="space-y-5">
		<h1 className="text-4xl leading-tight font-bold text-cyan-900 sm:text-5xl">{title}</h1>
		{description ? <p className="text-base leading-6 text-cyan-950 sm:text-lg sm:leading-7">{description}</p> : null}
	</div>
);
