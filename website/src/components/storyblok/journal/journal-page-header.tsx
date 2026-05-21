import { SectionHeading } from '@/components/section-heading';

type Props = {
	title: string;
	description?: string;
};

export const JournalPageHeader = ({ title, description }: Props) => (
	<div className="space-y-5">
		<SectionHeading as="h1" align="left" bold className="mb-0 text-4xl leading-tight text-cyan-900 sm:text-5xl md:mb-0">
			{title}
		</SectionHeading>
		{description && <p className="text-base leading-6 text-cyan-950 sm:text-lg sm:leading-7">{description}</p>}
	</div>
);
