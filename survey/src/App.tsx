import { SoButton, SoTypography } from '@socialincome/ui';
import '@socialincome/ui/dist/index.css';
import { useState } from 'react';
import './App.css';

function App() {
	const [count, setCount] = useState(0);

	return (
		<div className="App">
			<SoTypography element="h1" size="5xl">
				Vite + React
			</SoTypography>
			<div className="card">
				<SoButton onClick={() => setCount((count) => count + 1)}>count is {count}</SoButton>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">Click on the Vite and React logos to learn more</p>
		</div>
	);
}

export default App;
