'use client';

import { DefaultParams } from '@/app/[lang]/[region]';
import { SiGoogle } from '@icons-pack/react-simple-icons';
import { Button } from '@socialincome/ui';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from 'reactfire';

type SocialSignInButtonsProps = {
	translations: {
		signInWithGoogle: string;
	};
} & DefaultParams;

export function SocialSignInButtons({ lang, region, translations }: SocialSignInButtonsProps) {
	const router = useRouter();
	const auth = useAuth();

	const onGoogleSignIn = () => {
		const provider = new GoogleAuthProvider();
		signInWithPopup(auth, provider)
			.then(async () => {
				router.push(`/${lang}/${region}/me`);
			})
			.catch((error) => {
				console.log(error);
			});
	};

	return (
		<div className="mx-auto">
			<Button variant="outline" className="inline-flex" Icon={SiGoogle} onClick={onGoogleSignIn}>
				{translations.signInWithGoogle}
			</Button>
		</div>
	);
}
