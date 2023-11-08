'use client';

import Cookies, { CookieAttributes } from 'js-cookie';
import { useState } from 'react';

export const useCookieState = <T extends string>(key: string, initialValue?: T, options?: CookieAttributes) => {
	const [value, setValue] = useState<T | undefined>(() => {
		let value = Cookies.get(key) as T;
		if (value) {
			return value;
		} else if (initialValue) {
			Cookies.set(key, initialValue, options);
			return initialValue;
		} else {
			return undefined;
		}
	});

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
