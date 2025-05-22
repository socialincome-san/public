'use client';

import Cookies, { CookieAttributes } from 'js-cookie';
import { useEffect, useState } from 'react';

export const useCookieState = <T extends string>(key: string, initialValue?: T, options?: CookieAttributes) => {
	const [value, setValue] = useState<T | undefined>(undefined);

	useEffect(() => {
		// Setting the initial value for a cookie is intentionally done in useEffect and not in useState, so that the
		// initial state value is always undefined. This is required so that statically rendered pages are always the
		// same as the initial state of the client side rendered page.
		const val = Cookies.get(key) as T;
		if (val) {
			setValue(val);
		} else if (initialValue) {
			Cookies.set(key, initialValue, options);
			setValue(initialValue);
		}
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
