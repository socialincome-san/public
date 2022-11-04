import React, { useState } from 'react';

// @ts-ignore
export default function Counter({ children, count: initialCount }) {
	const [count, setCount] = useState(initialCount);
	// @ts-ignore
	const add = () => setCount((i) => i + 1);
	// @ts-ignore
	const subtract = () => setCount((i) => i - 1);

	return (
		<>
			<div>
				<button onClick={subtract}>-</button>
				<pre>{count}</pre>
				<button onClick={add}>+</button>
			</div>
			<div>{children}</div>
		</>
	);
}
