'use client';

import { Input } from '@/components/input';
import { useEffect, useRef, useState } from 'react';

const DEBOUNCE_MS = 300;

type Props = {
	value: string;
	onDebouncedChange: (value: string) => void;
	placeholder?: string;
};

export const SearchInput = ({ value, onDebouncedChange, placeholder }: Props) => {
	const [local, setLocal] = useState(value);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		setLocal(value);
	}, [value]);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const handleChange = (next: string) => {
		setLocal(next);
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		timeoutRef.current = setTimeout(() => onDebouncedChange(next), DEBOUNCE_MS);
	};

	return (
		<Input
			type="search"
			value={local}
			onChange={(e) => handleChange(e.target.value)}
			placeholder={placeholder ?? 'Search…'}
		/>
	);
};
