'use client';

import { useContext } from 'react';
import { NavbarBackgroundContext } from './navbar-background-provider';

export const useNavbarBackground = () => {
	const { backgroundColor, setBackgroundColor } = useContext(NavbarBackgroundContext);

	return { backgroundColor, setBackgroundColor };
}
