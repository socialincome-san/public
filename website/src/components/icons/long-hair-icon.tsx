import { cn } from '@/lib/utils/cn';

type Props = {
	className?: string;
};

export const LongHairIcon = ({ className }: Props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="20"
		height="20"
		viewBox="0 0 20 20"
		fill="none"
		aria-hidden
		className={cn('shrink-0', className)}
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
