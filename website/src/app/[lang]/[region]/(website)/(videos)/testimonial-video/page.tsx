import { DefaultPageProps } from '@/app/[lang]/[region]';
import { VimeoVideo } from '@/components/legacy/vimeo-video';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import {
	BaseContainer,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Table,
	TableBody,
	TableCell,
	TableRow,
	Typography,
} from '@socialincome/ui';

export default async function Page({ params }: DefaultPageProps) {
	const { lang } = await params;
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-videos'],
	});

	return (
		<BaseContainer className="flex flex-col space-y-8">
			<div className="aspect-video overflow-hidden rounded-lg">
				<VimeoVideo videoId={Number(translator.t('id.video-01'))} />
			</div>
			<div className="mt-2 self-end">
				<Popover openDelay={0} closeDelay={200}>
					<PopoverTrigger>
						<Typography>{translator.t('credits')}</Typography>
					</PopoverTrigger>
					<PopoverContent align="end" className="w-96">
						<Table>
							<TableBody>
								{translator.t<{ role: string; name: string }[]>('video-01.credits').map(({ role, name }, index) => (
									<TableRow key={index}>
										<TableCell className="p-1.5 font-medium">{role}</TableCell>
										<TableCell className="p-1.5">{name}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</PopoverContent>
				</Popover>
			</div>
		</BaseContainer>
	);
}
