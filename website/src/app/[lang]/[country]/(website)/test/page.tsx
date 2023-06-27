import { DefaultPageProps } from '@/app/[lang]/[country]';
import ClientComponent from '@/components/client-component';

export default async function Page({ params }: DefaultPageProps) {
	return <ClientComponent />;
}
