import { usePathname } from 'next/navigation';

export const useIsPage = (page: string) => {
	const pathname = usePathname();
	// URL structure: /[lang]/[region]/[page]
	const segments = pathname.split('/');

	// If `page` is blank and `segments` length is less than 4, it’s the home page
	if (!page) {
		return segments.length < 4;
	}

	return segments.length >= 4 ? segments[3] === page : false;
}
