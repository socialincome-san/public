import { SectionHeading } from '@/components/section-heading';

type Props = {
	title: string;
	description?: string;
};

export const JournalPageHeader = ({ title, description }: Props) => (
	<div className="space-y-5">
		<SectionHeading as="h1" size={1} align="left" bold className="text-foreground mb-0 leading-tight md:mb-0">
			{title}
		</SectionHeading>
		{description && <p className="text-foreground text-base leading-6 sm:text-lg sm:leading-7">{description}</p>}
	</div>
);
