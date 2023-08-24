'use client';

import { Button, Input } from '@socialincome/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Section1InputProps {
	text: string;
}
export default function Section1Input({ text }: Section1InputProps) {
	const [amount, setAmount] = useState<number | undefined>(0);
	const router = useRouter();

	return (
		<>
			<Input
				className="my-4"
				color="secondary"
				type="number"
				name="amount"
				placeholder="6700"
				onChange={(e) => setAmount(Number(e.target.value))}
				value={amount}
			/>
			<Button
				color="secondary"
				size="lg"
				disabled={!amount}
				className="btn-block"
				onClick={() => {
					router.push(`/donate?amount=${(amount! / 100).toFixed(2)}`);
				}}
			>
				Show my Impact
			</Button>
		</>
	);
}
