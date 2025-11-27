'use client';

import { useContext } from 'react';
import { NavbarBackgroundContext } from './navbar-background-provider';

export function useNavbarBackground() {
	const { backgroundColor, setBackgroundColor } = useContext(NavbarBackgroundContext);

	return { backgroundColor, setBackgroundColor };
}
