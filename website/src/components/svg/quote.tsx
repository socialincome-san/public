type Props = {
	className?: string;
};

export const QuoteIcon = ({ className = '' }: Props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="39"
		height="35"
		viewBox="0 0 39 35"
		fill="none"
		className={className}
		aria-hidden="true"
	>
		<path
			d="M38.171 0L31.654 19.95H37.506V34.181H22.61V18.354L30.324 0H38.171ZM15.561 0L9.044 19.95H14.896V34.181H0V18.354L7.714 0H15.561Z"
			fill="currentColor"
		/>
	</svg>
);
