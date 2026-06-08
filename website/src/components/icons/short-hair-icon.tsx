import { cn } from '@/lib/utils/cn';

type Props = {
	className?: string;
};

export const ShortHairIcon = ({ className }: Props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="20"
		height="20"
		viewBox="0 0 20 20"
		fill="none"
		aria-hidden
		className={cn('shrink-0', className)}
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
