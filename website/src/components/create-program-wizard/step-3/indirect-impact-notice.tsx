'use client';

type Props = {
	recipients: number;
};

export function IndirectImpactNotice({ recipients }: Props) {
	const indirect = recipients * 5;

	return (
		<div className="flex items-center gap-3 rounded-b-xl bg-green-200/70 px-6 py-4 text-sm">
			<span className="text-lg">🎉</span>
			<p>
				{recipients} recipients benefit{' '}
				<p
					className="inline cursor-help underline decoration-dotted underline-offset-4"
					title="On average, each supported recipient positively impacts around five additional people in their household and community."
				>
					{indirect.toLocaleString('de-CH')} additional indirect people
				</p>{' '}
				in poverty.
			</p>
		</div>
	);
}
