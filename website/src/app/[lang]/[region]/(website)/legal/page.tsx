'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
	useEffect(() => {
		redirect('./legal/privacy');
	}, []);
}
