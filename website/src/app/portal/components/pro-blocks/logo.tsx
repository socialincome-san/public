interface LogoProps {
	width?: number;
	height?: number;
	className?: string;
}

export const Logo: React.FC<LogoProps> = ({ width = 64, height = 38, className = '' }) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox="0 0 64386"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<g clip-path="url(#clip0_25081_934)">
				<path d="M64.3178 1.08047H56.7031V37.1704H64.3178V1.08047Z" fill="#164E63" />
				<path d="M44.7976 1.83469L28.9069 34.543L35.8081 37.6315L51.6988 4.92322L44.7976 1.83469Z" fill="#164E63" />
				<path d="M28.8033 8.88818L0 32.0868L4.89469 37.685L33.698 14.4864L28.8033 8.88818Z" fill="#164E63" />
			</g>
			<defs>
				<clipPath id="clip0_25081_934">
					<rect width="64" height="37" fill="white" transform="translate(0 0.5)" />
				</clipPath>
			</defs>
		</svg>
	);
};
