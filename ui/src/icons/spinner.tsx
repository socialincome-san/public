import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export function SpinnerIcon({ className, ...props }: HTMLAttributes<SVGElement>) {
	return (
		<svg
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			xmlSpace="preserve"
			fill="none"
			aria-hidden={true}
			aria-labelledby="si-logo-title"
			viewBox="0 0 24 24"
			className={twMerge('h-5 w-5 animate-spin', className)}
			{...props}
		>
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
	);
}
