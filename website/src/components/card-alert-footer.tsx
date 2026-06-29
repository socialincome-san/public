export type CardAlertFooterVariant = 'confirm' | 'secondary';

type Props = {
	text: string;
	variant: CardAlertFooterVariant;
};

export const CardAlertFooter = ({ text, variant }: Props) => (
	<div className="flex items-center gap-2 rounded-b-2xl px-4 py-2">
		{variant === 'confirm' ? (
			<span className="relative flex size-2 shrink-0" aria-hidden>
				<span className="bg-confirm animation-duration-[2s] absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:animate-none" />
				<span className="bg-confirm relative inline-flex size-2 rounded-full" />
			</span>
		) : null}
		<p className="text-xs font-medium text-slate-950">{text}</p>
	</div>
);
