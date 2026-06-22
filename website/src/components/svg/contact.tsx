type Props = {
	className?: string;
};

export const ContactIcon = ({ className = '' }: Props) => (
	<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M2 4C2 3.44772 2.44772 3 3 3H17C17.5523 3 18 3.44772 18 4V16C18 16.5523 17.5523 17 17 17H3C2.44772 17 2 16.5523 2 16V4ZM2 4L10 9L18 4Z"
			fill="currentColor"
		/>
	</svg>
);
