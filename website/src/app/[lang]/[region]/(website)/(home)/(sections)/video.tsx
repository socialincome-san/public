import { VimeoVideo } from '@/components/vimeo-video';
import { LanguageCode } from '@socialincome/shared/src/types/language';
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

export async function Video({ lang }: { lang: LanguageCode }) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-home', 'common'],
	});

	return (
		<BaseContainer className="flex flex-col justify-center py-8 md:pb-16">
			<div className="overflow-hidden rounded-lg">
				<VimeoVideo videoId={Number(translator.t('video.video-id'))} />
			</div>
			<div className="mt-2 self-end">
				<Popover openDelay={0} closeDelay={200}>
					<PopoverTrigger>
						<Typography>{translator.t('video.credits-title')}</Typography>
					</PopoverTrigger>
					<PopoverContent align="end" className="w-96">
						<Table>
							<TableBody>
								{translator
									.t<{ role: string; name: string }[]>('video.credits-content')
									.map(({ role, name }, index) => (
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
