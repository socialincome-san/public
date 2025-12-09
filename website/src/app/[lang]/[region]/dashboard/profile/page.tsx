import { DefaultPageProps } from '../..';
import { ProfileForm } from './profile-form';

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	return <ProfileForm />;
}
