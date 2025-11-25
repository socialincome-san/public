'use client';

import { createContext, PropsWithChildren, useState } from 'react';

export const NavbarBackgroundContext = createContext<{
	backgroundColor: string | null;
	setBackgroundColor: (background: string | null) => void;
}>({
	backgroundColor: null,
	setBackgroundColor: () => {},
});

export function NavbarBackgroundProvider({ children }: PropsWithChildren) {
	const [backgroundColor, setBackgroundColor] = useState<string | null>(null);

	return (
		<NavbarBackgroundContext.Provider value={{ backgroundColor, setBackgroundColor }}>
			{children}
		</NavbarBackgroundContext.Provider>
	);
}
