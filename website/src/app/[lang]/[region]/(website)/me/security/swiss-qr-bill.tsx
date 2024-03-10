'use client';

import { useUser } from 'reactfire';
import { useQuery } from '@tanstack/react-query';

type SwissQrBillSectionProps = {

};

export default function SwissQrBillSection({  }: SwissQrBillSectionProps) {
	const { data: authUser } = useUser();
	const { data: qrBillSVG } = useQuery({
		queryKey: ['qr-bill', authUser?.uid],
		queryFn: async () => {
			const firebaseAuthToken = await authUser?.getIdToken(true);
			const response = await fetch(`/api/user/qr-bill?firebaseAuthToken=${firebaseAuthToken}`);
			return (await response.json())
		},
		staleTime: 1000 * 60 * 60, // 1 hour
	});

	console.log(qrBillSVG);

	return (
		<>{qrBillSVG && <div dangerouslySetInnerHTML={{ __html: qrBillSVG.svg }}></div>}</>
	)

}