'use client';

import { useState } from 'react';

export function useNavbarBackground() {
	const [backgroundColor, setBackgroundColor] = useState<string | null>();

	return { backgroundColor, setBackgroundColor };
}
