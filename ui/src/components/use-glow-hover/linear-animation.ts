'use client';

interface LinearAnimationParams {
	onProgress: (progress: number) => void;
	onIdUpdate?: (id: number) => void;
	time: number;
	initialProgress?: number;
}

export const linearAnimation = ({
	onProgress,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	onIdUpdate = () => {},
	time,
	initialProgress = 0,
}: LinearAnimationParams) => {
	if (time === 0) {
		onProgress(1);
		onIdUpdate(null);
		return;
	}

	let start: number = null;
	const step = (timestamp: number) => {
		if (!start) start = timestamp;
		const progress = Math.min((timestamp - start) / time + initialProgress, 1);

		onProgress(progress);

		if (progress < 1) {
			onIdUpdate(window.requestAnimationFrame(step));
		} else {
			onIdUpdate(null);
		}
	};
	onIdUpdate(window.requestAnimationFrame(step));
};
