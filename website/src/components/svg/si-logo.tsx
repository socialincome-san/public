type Props = {
	width?: number;
	height?: number;
	className?: string;
};

export const SILogo = ({ width = 64, height = 37, className = '' }: Props) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill="none" className={className}>
		<path
			fill="currentColor"
			d="M64.318 0h-7.615v36.09h7.615zm-19.52.754L28.907 33.463l6.901 3.088 15.89-32.708zM28.803 7.808 0 31.006l4.895 5.599 28.803-23.199z"
		></path>
	</svg>
);
