export const downloadBase64File = (base64: string, mimeType: string, filename: string) => {
	const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
	const blob = new Blob([bytes], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
};
