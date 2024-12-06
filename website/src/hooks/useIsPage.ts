import { usePathname } from 'next/navigation';

export function useIsPage(page: string) {
	const pathname = usePathname();

	// /[lang]/[region]/[page]
	return pathname.split('/')[3] === page;
}
