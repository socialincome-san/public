import { Fragment, useEffect, useState } from 'react';

export default function ApplePay() {
	const [hasApplePay, setHasApplePay] = useState(false);
	// This will be only executed on the client, not on the server
	useEffect(() => {
		if (window.ApplePaySession && window.ApplePaySession.canMakePayments) {
			setHasApplePay(true);
		}
	}, []);

	return <Fragment>{hasApplePay && <div>Browser has Apple Pay</div>}</Fragment>;
}
