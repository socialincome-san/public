'use client';

import { SoTypography } from '@socialincome/ui';
import { useState } from 'react';

export default function ClientComponent() {
	const [count, setCount] = useState(0);
	return (
		<div className="bg-amber-50">
			<SoTypography element="h1" size="4xl"></SoTypography>
			<div onClick={() => setCount((prevState) => prevState + 1)}>
				<div>This is a client component</div>
				<div>Count {count}</div>
			</div>
		</div>
	);
}
