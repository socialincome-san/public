import { Card } from '@/components/card';
import Link from 'next/link';
import type { ReactNode } from 'react';

type ProgramWalletProps = {
	title: string;
	subtitle: string;
	paidOut: { label: string; currency: string; amount: string };
	recipients: { label: string; amount: string };
	href?: string;
	badge?: ReactNode;
};

// Figma node 28719:27189
const imgWalletShape = 'https://www.figma.com/api/mcp/asset/1cd0e2b4-3cc0-463c-a531-d01bf5d17781';

export const ProgramWallet = ({ title, subtitle, paidOut, recipients, href, badge }: ProgramWalletProps) => {
	const content = (
		<Card variant="noPadding" className="relative h-[293px] w-[405px] overflow-hidden rounded-3xl text-white shadow-lg">
			<img
				alt=""
				src={imgWalletShape}
				className="absolute inset-0 h-full w-full object-cover"
				loading="lazy"
				decoding="async"
			/>

			<div className="relative flex h-full flex-col justify-between px-7 pb-8 pt-20">
				<div className="flex flex-col gap-0.5">
					<p className="text-4xl leading-none font-normal">{title}</p>
					<p className="text-base leading-6 font-semibold opacity-95">{subtitle}</p>
					{badge ? <div className="mt-3">{badge}</div> : null}
				</div>

				<div className="flex items-start justify-between gap-6">
					<div className="flex min-w-0 flex-1 flex-col items-start">
						<p className="text-base leading-6 font-semibold opacity-95">{paidOut.label}</p>
						<div className="flex items-end gap-1">
							<p className="h-[23px] w-[33px] text-base leading-6 font-semibold opacity-95">{paidOut.currency}</p>
							<p className="text-4xl leading-none font-normal">{paidOut.amount}</p>
						</div>
					</div>

					<div className="flex min-w-0 flex-1 flex-col items-end text-right">
						<p className="text-base leading-6 font-semibold opacity-95">{recipients.label}</p>
						<p className="text-4xl leading-none font-normal">{recipients.amount}</p>
					</div>
				</div>
			</div>
		</Card>
	);

	return href ? <Link href={href}>{content}</Link> : content;
};

