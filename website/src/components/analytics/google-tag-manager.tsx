'use client';

import { useEffect } from 'react';

export function GoogleTagManager() {
	useEffect(() => {
		if (process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID) {
			const gtmScript = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID}');`;
			const scriptElement = document.createElement('script');
			scriptElement.textContent = gtmScript;
			document.head.appendChild(scriptElement);

			document.body.appendChild(document.createElement('noscript')).innerHTML = `
				<iframe 
					src='https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID}'
					height='0'
					width='0'
					style='display:none;visibility:hidden'/>
			`;
			console.debug('Enabled Google Tag Manager tracking');
		}
	}, []);

	return null;
}
