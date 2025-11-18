import { useId } from 'react';

type FlagSierraLeoneProps = {
	width?: number;
	height?: number;
	className?: string;
};

export function FlagSierraLeone({ width = 16, height = 16, className = '' }: FlagSierraLeoneProps) {
	const clipId = useId();

	return (
		<svg
			width={width}
			height={height}
			viewBox="0 0 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<g clipPath={`url(#${clipId})`}>
				<path
					d="M15.5024 10.7826C15.824 9.91592 16 8.97854 16 7.99998C16 7.02142 15.824 6.08404 15.5024 5.21738L8 4.52173L0.497594 5.21738C0.176 6.08404 0 7.02142 0 7.99998C0 8.97854 0.176 9.91592 0.497594 10.7826L8 11.4782L15.5024 10.7826Z"
					fill="#F0F0F0"
				/>
				<path
					d="M7.99853 16C11.4382 16 14.3706 13.829 15.5009 10.7826H0.496094C1.62647 13.829 4.55878 16 7.99853 16Z"
					fill="#338AF3"
				/>
				<path
					d="M7.99853 0C4.55878 0 1.62647 2.171 0.496094 5.21741H15.5009C14.3706 2.171 11.4382 0 7.99853 0Z"
					fill="#6DA544"
				/>
			</g>
			<defs>
				<clipPath id={clipId}>
					<rect width="16" height="16" fill="white" />
				</clipPath>
			</defs>
		</svg>
	);
}
