import { DefaultLayoutProps } from '@/app/[lang]/[country]';
import { BaseContainer, Typography } from '@socialincome/ui';

import { SiFacebook, SiInstagram } from '@icons-pack/react-simple-icons';
import Link from 'next/link';

export default async function ({ params }: DefaultLayoutProps) {
	return (
		<BaseContainer>
			<div className="grid grid-cols-4 py-8">
				<div className="flex flex-col space-y-2">
					<Typography size="lg" weight="medium">
						Follow us
					</Typography>
					<Link
						href="https://www.instagram.com/so_income/"
						target="_blank"
						className="link link-hover inline-flex items-center space-x-2"
					>
						<SiInstagram className="h-4 w-4" />
						<Typography size="sm">Instagram</Typography>
					</Link>
					<Link
						href="https://www.facebook.com/socialincome.org"
						target="_blank"
						className="link link-hover inline-flex items-center space-x-2"
					>
						<SiFacebook className="h-4 w-4" />
						<Typography size="sm">Facebook</Typography>
					</Link>
				</div>
			</div>
		</BaseContainer>
	);
}
