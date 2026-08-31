type TurnstileRenderOptions = {
	sitekey: string;
	callback?: (token: string) => void;
	'error-callback'?: () => void;
	'expired-callback'?: () => void;
	language?: string;
};

type TurnstileApi = {
	remove: (widgetId: string) => void;
	render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
};

declare global {
	interface Window {
		turnstile?: TurnstileApi;
	}
}

export {};
