'use client';

import { DefaultPageProps } from '@/app/[lang]/[country]';
import { redirect } from 'next/navigation';
import { useUser } from 'reactfire';

export default function Page({ params }: DefaultPageProps) {
	const { status, data: user } = useUser();

	if (status === 'success') {
		if (user) {
			redirect('./me/contact-details');
		} else {
			redirect(`/${params.lang}/${params.country}/login`);
		}
	}
	return null;
}
