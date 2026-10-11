export const ContactIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M2 4C2 3.44772 2.44772 3 3 3H17C17.5523 3 18 3.44772 18 4V16C18 16.5523 17.5523 17 17 17H3C2.44772 17 2 16.5523 2 16V4ZM2 4L10 9L18 4Z"
			fill="currentColor"
		/>
	</svg>
);

export const PaperPlaneIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M2.09333 9.04069C7.01464 6.89654 10.2963 5.48299 11.9383 4.80003C16.6264 2.85004 17.6006 2.5113 18.2355 2.50012C18.3752 2.49766 18.6874 2.53227 18.8897 2.69639C19.0605 2.83497 19.1075 3.02218 19.13 3.15357C19.1525 3.28496 19.1805 3.58427 19.1582 3.81814C18.9041 6.48753 17.8048 12.9654 17.2456 15.9552C17.009 17.2203 16.543 17.6444 16.0919 17.686C15.1116 17.7762 14.3671 17.0381 13.4176 16.4157C11.9318 15.4417 11.0925 14.8354 9.65023 13.885C7.9835 12.7866 9.06397 12.1829 10.0138 11.1964C10.2624 10.9382 14.5818 7.00931 14.6654 6.6529C14.6759 6.60832 14.6856 6.44217 14.5869 6.35443C14.4882 6.2667 14.3425 6.2967 14.2374 6.32056C14.0883 6.35438 11.7148 7.92324 7.11663 11.0271C6.4429 11.4898 5.83266 11.7152 5.2859 11.7034C4.68314 11.6903 3.52368 11.3626 2.66174 11.0824C1.60453 10.7387 0.764283 10.557 0.837449 9.97338C0.875559 9.66938 1.29419 9.35849 2.09333 9.04069Z"
			fill="currentColor"
		/>
	</svg>
);

export const QuoteIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="36" height="32" viewBox="0 0 39 35" fill="none" aria-hidden="true">
		<path
			d="M38.171 0L31.654 19.95H37.506V34.181H22.61V18.354L30.324 0H38.171ZM15.561 0L9.044 19.95H14.896V34.181H0V18.354L7.714 0H15.561Z"
			fill="currentColor"
		/>
	</svg>
);

type HairIconProps = {
	size?: number;
};

export const LongHairIcon = ({ size = 20 }: HairIconProps) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 20 20"
		fill="none"
		aria-hidden
		className="shrink-0"
	>
		<path
			d="M5.47656 17.2455L6.29073 17.013C7.00656 16.8088 7.4999 16.1546 7.4999 15.4105V14.168"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M14.5233 17.2455L13.7092 17.013C12.9933 16.8088 12.5 16.1546 12.5 15.4105V14.168"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M6.33203 12.2185C7.13703 13.3927 8.4787 14.1635 9.9987 14.1635C11.6937 14.1635 13.167 13.2069 13.9195 11.7969"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M17.7787 17.4987C19.2787 13.557 17.2571 14.4254 17.2571 8.33203C17.2571 4.18953 14.0079 0.832031 9.99875 0.832031C5.98958 0.832031 2.74125 4.18953 2.74125 8.33203C2.74125 14.4254 0.720412 13.557 2.21958 17.4987"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M5.73047 13.024L6.43047 12.0923C6.93797 11.4156 7.01964 10.5106 6.64214 9.75396L5.77047 8.01146C8.4738 8.01146 10.8371 6.19146 11.528 3.57812L13.6863 6.08729C14.2963 6.79646 14.3996 7.80979 13.9455 8.62729L13.6221 9.21063C13.1571 10.0481 13.278 11.089 13.9221 11.7973L14.6546 12.6365"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

export const ShortHairIcon = ({ size = 20 }: HairIconProps) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="0 0 20 20"
		fill="none"
		aria-hidden
		className="shrink-0"
	>
		<g clipPath="url(#short-hair-clip)">
			<path
				d="M5.30859 6.32177C7.49859 7.1551 9.99859 6.66927 11.6653 4.58594C12.4294 5.91594 13.2778 6.59177 14.6003 7.1551"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M1.66602 18.3346L5.68602 17.1863C6.75935 16.8796 7.49935 15.8988 7.49935 14.7821V14.168"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M18.3333 18.3346L14.3133 17.1863C13.24 16.8796 12.5 15.8988 12.5 14.7821V14.168"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M14.366 10.4688L14.8735 7.42214C15.3752 4.41047 13.0527 1.66797 9.99938 1.66797C6.94604 1.66797 4.62271 4.40964 5.12521 7.42214L5.63271 10.4688C5.98854 12.603 7.83521 14.168 9.99938 14.168C12.1635 14.168 14.0102 12.6038 14.366 10.4688Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</g>
		<defs>
			<clipPath id="short-hair-clip">
				<rect width="20" height="20" fill="white" />
			</clipPath>
		</defs>
	</svg>
);
