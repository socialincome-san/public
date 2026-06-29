export const openBase64FileInNewTab = (
	base64: string,
	mimeType: string,
	filename: string,
	targetWindow: Window | null,
): boolean => {
	const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
	const blob = new Blob([bytes], { type: mimeType });
	const url = URL.createObjectURL(blob);

	if (!targetWindow) {
		URL.revokeObjectURL(url);

		return false;
	}

	try {
		targetWindow.document.title = filename;
		targetWindow.document.body.replaceChildren();

		const container = targetWindow.document.createElement('main');
		container.style.fontFamily = 'system-ui, sans-serif';
		container.style.padding = '24px';

		const message = targetWindow.document.createElement('p');
		message.textContent = 'Your download should start automatically.';

		const link = targetWindow.document.createElement('a');
		link.href = url;
		link.download = filename;
		link.textContent = `Download ${filename}`;

		container.append(message, link);
		targetWindow.document.body.append(container);
		targetWindow.opener = null;
		targetWindow.focus();
		link.click();
	} catch {
		URL.revokeObjectURL(url);

		return false;
	}

	window.setTimeout(() => URL.revokeObjectURL(url), 60_000);

	return true;
};
