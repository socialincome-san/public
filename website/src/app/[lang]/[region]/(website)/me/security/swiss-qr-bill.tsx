'use client';

import { useApi } from '@/hooks/useApi';
import { useQuery } from '@tanstack/react-query';
import { useUser } from 'reactfire';

type SwissQrBillSectionProps = {};

export default function SwissQrBillSection({}: SwissQrBillSectionProps) {
	const { data: authUser } = useUser();
	const api = useApi();

	const { data: qrBillSVG } = useQuery({
		queryKey: ['qr-bill', authUser?.uid],
		queryFn: async () => {
			const response = await api.post('/api/swiss-qr-bill', { amount: 1 });
			return await response.json();
		},
		staleTime: 1000 * 60 * 60, // 1 hour
	});

	console.log(qrBillSVG);

	return <>{qrBillSVG && <div dangerouslySetInnerHTML={{ __html: qrBillSVG.svg }}></div>}</>;
}
