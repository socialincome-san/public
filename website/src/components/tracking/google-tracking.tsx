'use client';

import React, { useEffect } from 'react';

export function GoogleTagManagerScript: React.FC = () => {
    useEffect(() => {

        const gtmScript = `(function(w,d,s,l,i){
            w[l]=w[l]||[];
            w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
            var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
            j.async=true;
            j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
            f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-M38KPW6');`

        const scriptElement = document.createElement('script');
        scriptElement.textContent = gtmScript;
        document.head.appendChild(scriptElement);

        const gtmBody = `noscript>
        <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-M38KPW6"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
        ></iframe>
        </noscript>`

        document.body.insertAdjacentHTML("afterbegin", gtmBody);

    }, []);

    return null;
};
