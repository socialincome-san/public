import { BlockWrapper } from '@/components/block-wrapper';
import { ReactNode } from 'react';

type Props = {
	title: string;
	stats?: ReactNode;
	children?: ReactNode;
};

export const PreviewPage = ({ title, stats, children }: Props) => {
	return (
		<BlockWrapper className="my-8 lg:my-16">
			<section className="flex flex-col gap-6">
				<header className="flex flex-col gap-3">
					<h1 className="text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
					{stats ? <div className="text-muted-foreground">{stats}</div> : null}
				</header>
				{children}
			</section>
		</BlockWrapper>
	);
};
