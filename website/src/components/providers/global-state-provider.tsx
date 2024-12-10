import { createContext, ReactNode, useContext, useState } from 'react';

type GlobalStateProviderContextType = {
	backgroundColor: string | null;
	setBackgroundColor: (color: string | null) => void;
};

const GlobalStateProviderContext = createContext<GlobalStateProviderContextType | undefined>(undefined);

export const GlobalStateProviderProvider = ({ children }: { children: ReactNode }) => {
	const [backgroundColor, setBackgroundColor] = useState<string | null>(null);

	return (
		<GlobalStateProviderContext.Provider value={{ backgroundColor, setBackgroundColor }}>
			{children}
		</GlobalStateProviderContext.Provider>
	);
};

export const useGlobalStateProvider = () => {
	const context = useContext(GlobalStateProviderContext);
	if (context === undefined) {
		throw new Error('useGlobalStateProvider must be used within a GlobalStateProviderProvider');
	}
	return context;
};
