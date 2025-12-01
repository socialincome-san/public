'use client';

import Cookies, { CookieAttributes } from 'js-cookie';
import { useEffect, useState } from 'react';

export const useCookieState = <T extends string>(key: string, initialValue?: T, options?: CookieAttributes) => {
	const [value, setValue] = useState<T | undefined>(undefined);

	const initialize = () => {
		const val = Cookies.get(key) as T | undefined;

		if (val !== undefined) {
			setValue(val);
		} else if (initialValue !== undefined) {
			Cookies.set(key, initialValue, options);
			setValue(initialValue);
		}
	};

	useEffect(() => {
		initialize(); // ☑️ safe (no lint error)
	}, [key, initialValue, options]);

	const setCookie = (val: T, options?: CookieAttributes) => {
		Cookies.set(key, val, options);
		setValue(val);
	};

	const deleteCookie = () => {
		setValue(undefined);
		Cookies.remove(key);
	};

	return { value, setCookie, deleteCookie };
};
