type Props = {
	className?: string;
};

export const XIcon = ({ className = '' }: Props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 15.488 14"
		fill="none"
		className={className}
		aria-hidden="true"
	>
		<path d="M6.97169 9.10102L2.68119 14H0.304688L5.86169 7.65202L6.97169 9.10102Z" fill="currentColor" />
		<path d="M8.26823 4.494L12.1967 0H14.5717L9.36823 5.951L8.26823 4.494Z" fill="currentColor" />
		<path
			d="M15.488 14H10.7085L0 0H4.9005L15.488 14ZM11.364 12.5785H12.68L4.1855 1.347H2.7735L11.364 12.5785Z"
			fill="currentColor"
		/>
	</svg>
);
