import { cn } from '@/lib/utils/cn';
import type { ReactNode } from 'react';

type FallbackPageProps = {
	eyebrow: string;
	title: string;
	description: string;
	detail?: ReactNode;
	children?: ReactNode;
	className?: string;
};

export const FallbackPage = ({ eyebrow, title, description, detail, children, className }: FallbackPageProps) => {
	return (
		<section className={cn('flex min-h-[680px] items-center justify-center px-4 py-16', className)}>
			<div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white/70 p-8 text-center shadow-xl ring-1 ring-black/5 backdrop-blur md:p-12">
				<div className="from-primary/15 via-secondary/20 absolute inset-x-10 top-0 h-24 rounded-full bg-linear-to-r to-transparent blur-3xl" />
				<div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
					<p className="text-primary text-sm font-semibold tracking-[0.24em] uppercase">{eyebrow}</p>
					<div className="space-y-4">
						<h1 className="text-primary text-3xl leading-tight font-semibold tracking-tight md:text-4xl">{title}</h1>
						<p className="text-muted-foreground mx-auto max-w-xl text-base leading-7 md:text-lg">{description}</p>
					</div>
					{children && <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">{children}</div>}
					{detail && <div className="text-muted-foreground text-sm">{detail}</div>}
				</div>
			</div>
		</section>
	);
};
