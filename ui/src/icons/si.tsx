import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export function SIIcon({ className, ...props }: HTMLAttributes<SVGElement>) {
	return (
		<svg
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			xmlSpace="preserve"
			fill="currentColor"
			aria-hidden={true}
			aria-labelledby="si-icon"
			viewBox="0 0 816 815.8"
			className={twMerge('text-accent', className)}
			{...props}
		>
			<title id="si-icon">Social Income Icon</title>
			<g>
				<path id="Pfad_185" className="st0" d="M714.1,663.9h102v-512h-102V663.9z" />
				<path id="Pfad_186" className="st0" d="M366.4,631.9l92.8,43.3l216.3-463.8l-92.8-43.3L366.4,631.9z" />
				<path id="Pfad_187" className="st0" d="M0,596.7l65.8,78.4l392-329l-65.7-78.3L0,596.7z" />
			</g>
		</svg>
	);
}
