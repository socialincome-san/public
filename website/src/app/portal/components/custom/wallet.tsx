import { Card } from '@socialincome/ui';

export const Wallet = ({ children }: { children: React.ReactNode }) => {
	return (
		<Card
			className="flex flex-col overflow-hidden bg-pink-400"
			style={{
				['--shift' as any]: '50px',
				['--slant' as any]: '40px',
				['--slant-height' as any]: '14px',
				['--slant-position' as any]: 'calc(var(--shift) + var(--slant))',
				['--gradient' as any]:
					'linear-gradient(to right, hsl(var(--gradient-button-from)), hsl(var(--gradient-button-to)))',
				['--shadow-size' as any]: '11px',
				['--stack-height' as any]: '28px',
			}}
		>
			{/* Wallet header with card stack */}
			<div
				className="-mb-[var(--slant-height)] flex flex-col"
				style={{
					background: 'var(--gradient)',
				}}
			>
				<div
					className="relative m-[calc(3*var(--shadow-size))] mb-0 h-[var(--stack-height)] rounded-sm bg-white"
					style={{
						boxShadow:
							'0 0 0 var(--shadow-size) rgba(255,255,255,0.5), 0 0 0 calc(2* var(--shadow-size)) rgba(255,255,255,0.3)',
					}}
				></div>
			</div>

			{/* Wallet content */}
			<div
				className="flex-1 pt-9 text-white"
				style={{
					background: 'var(--gradient)',
					clipPath:
						'polygon(100% 0%, 100% 100%, 0% 100%, 0% 0%, var(--shift) 0%, var(--slant-position) var(--slant-height), calc(100% - var(--slant-position)) var(--slant-height), calc(100% - var(--shift)) 0%)',
				}}
			>
				{children}
			</div>
		</Card>
	);
};
