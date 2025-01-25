'use client';

interface LinearAnimationParams {
	onProgress: (progress: number) => void;
	onIdUpdate?: (id: number | undefined) => void;
	time: number;
	initialProgress?: number;
}

export const linearAnimation = ({
	onProgress,
	onIdUpdate = () => {},
	time,
	initialProgress = 0,
}: LinearAnimationParams) => {
	if (time === 0) {
		onProgress(1);
		onIdUpdate(undefined);
		return;
	}

	let start: number | undefined = undefined;
	const step = (timestamp: number) => {
		if (start === undefined) start = timestamp;
		const progress = Math.min((timestamp - start) / time + initialProgress, 1);

		onProgress(progress);

		if (progress < 1) {
			const id = window.requestAnimationFrame(step);
			onIdUpdate(id);
		} else {
			onIdUpdate(undefined);
		}
	};
	const id = window.requestAnimationFrame(step);
	onIdUpdate(id);
};
