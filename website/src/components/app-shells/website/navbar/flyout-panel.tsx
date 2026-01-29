import { NavItem } from '@/lib/services/storyblok/storyblok.types';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';

type Props = {
	item?: NavItem;
	onClose: () => void;
};

export const FlyoutPanel = ({ item, onClose }: Props) => (
	<div className="absolute left-0 right-0 mt-2 flex justify-center">
		<div
			className={cn(
				'container rounded-3xl bg-white px-10 py-8 shadow-xl transition-all duration-200 ease-out',
				item ? 'pointer-events-auto translate-y-1 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0',
			)}
		>
			{item && (
				<div className="flex gap-12">
					<div className="grid flex-1 grid-cols-3 gap-8">
						{item.sections?.map((section) => (
							<div key={section.title} className="flex flex-col gap-4">
								<div className="text-base font-semibold">{section.title}</div>
								<div className="flex flex-col gap-2">
									{section.items.map((child) => (
										<Link key={child.label} href={child.href} onClick={onClose} className="text-[15px] font-medium">
											{child.label}
										</Link>
									))}
								</div>
							</div>
						))}
					</div>
					<div className="min-w-[320px] max-w-[400px] flex-[0_0_30%] flex-shrink-0">
						<div className="rounded-2xl border bg-slate-50 p-6 text-center text-sm font-medium">Coming soon…</div>
					</div>
				</div>
			)}
		</div>
	</div>
);
