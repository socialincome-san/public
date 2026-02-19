import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { getMetadata } from '@/lib/utils/metadata';
import {
  BaseContainer,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Typography,
} from '@socialincome/ui';
import Link from 'next/link';

export const generateMetadata = async (props: DefaultPageProps) => {
  const params = await props.params;

  return getMetadata(params.lang as WebsiteLanguage, 'website-reporting');
};

export default async function Page({ params }: DefaultPageProps) {
  const { lang } = await params;
  const translator = await Translator.getInstance({
    language: lang as WebsiteLanguage,
    namespaces: ['website-reporting'],
  });

  return (
    <BaseContainer className="mx-auto flex max-w-3xl flex-col space-y-12">
      <Typography size="4xl" weight="bold">
        {translator.t('title')}
      </Typography>
      <Table>
        <TableCaption>{translator.t('table-caption')}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>{translator.t('table-columns.title')}</TableHead>
            <TableHead>{translator.t('table-columns.language')}</TableHead>
            <TableHead className="text-right">{translator.t('table-columns.href')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {translator.t<{ title: string; href: string; language: string }[]>('reports').map((report, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{report.title}</TableCell>
              <TableCell>{report.language}</TableCell>
              <TableCell className="text-right">
                <Link href={report.href} target="_blank" className="text-primary underline">
                  {translator.t('download-pdf')}
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </BaseContainer>
  );
}
