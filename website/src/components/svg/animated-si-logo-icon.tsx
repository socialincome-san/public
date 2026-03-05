'use client';

type Props = {
	width?: number;
	height?: number;
	className?: string;
};

export const AnimatedSILogoIcon = ({ width = 64, height = 37, className = '' }: Props) => {
	return (
		<>
			<style>{`
				@keyframes si-fall {
					0%, 45%, 100% { transform: translateY(0); opacity: 1; }
					20% { transform: translateY(6px); opacity: 0.75; }
				}
				.si-fall-1 { animation: si-fall 1.25s ease-in-out infinite; transform-origin: center; }
				.si-fall-2 { animation: si-fall 1.25s ease-in-out infinite 0.15s; transform-origin: center; }
				.si-fall-3 { animation: si-fall 1.25s ease-in-out infinite 0.3s; transform-origin: center; }
			`}</style>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width={width}
				height={height}
				viewBox="0 -2 65 43"
				fill="none"
				className={className}
				style={{ overflow: 'visible' }}
				aria-label="Social Income loading logo"
			>
				<path className="si-fall-3" fill="currentColor" d="M64.318 0h-7.615v36.09h7.615z" />
				<path className="si-fall-2" fill="currentColor" d="M44.798.754 28.907 33.463l6.901 3.088 15.89-32.708z" />
				<path className="si-fall-1" fill="currentColor" d="M28.803 7.808 0 31.006l4.895 5.599 28.803-23.199z" />
			</svg>
		</>
	);
};
