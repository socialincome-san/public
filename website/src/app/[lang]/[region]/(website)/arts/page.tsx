import { DefaultPageProps } from '@/app/[lang]/[region]';
import Section1 from './section-1';
import Section2 from './section-2';

export default async function Page(props: DefaultPageProps) {
  const { lang, region } = await props.params;

  return (
    <>
      <Section1 lang={lang} region={region} />
      <Section2 lang={lang} region={region} />
    </>
  );
}
