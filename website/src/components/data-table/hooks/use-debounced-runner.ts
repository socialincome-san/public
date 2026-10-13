import { useRef } from 'react';

export const useDebouncedRunner = () => {
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	return (run: () => void, debounceMs?: number) => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		if (debounceMs && debounceMs > 0) {
			timeoutRef.current = setTimeout(run, debounceMs);

			return;
		}

		run();
	};
};
