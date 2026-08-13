import Script from 'next/script';

export const TurnstileScript = () => (
	<Script
		id="cloudflare-turnstile"
		src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
		strategy="afterInteractive"
	/>
);
