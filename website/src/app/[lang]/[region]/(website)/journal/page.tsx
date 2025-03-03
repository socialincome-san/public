import { DefaultPageProps } from '@/app/[lang]/[region]';
import { getAuthors, loadOverviewBlogs } from '@/app/[lang]/[region]/(website)/journal/StoryblokApi';
import StoryblokAuthorImage from '@/app/[lang]/[region]/(website)/journal/StoryblokAuthorImage';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Card, CardContent, Typography } from '@socialincome/ui';
import { DateTime } from 'luxon';
import Image from 'next/image';
import Link from 'next/link';

export const revalidate = 900;

function getPublishedDateFormatted(date: string) {
	const dateObject = DateTime.fromISO(date);
	return dateObject.isValid ? dateObject.toFormat('dd/MM/yyyy') : '';
}

export default async function Page({ params: { lang, region } }: DefaultPageProps) {
	const blogObjects = (await loadOverviewBlogs(lang)).data.stories;
	const blogAuthorsResponse = (await getAuthors(lang)).data.stories;
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-journal'],
	});

	return (
		<BaseContainer>
			<Typography weight="bold" className="text-center" size="3xl">
				{translator.t('overview.title')}
			</Typography>
			<Typography className="mt-5 text-center" size="xl">
				{translator.t('overview.description')}
			</Typography>
			<Typography className="mt-16 text-center" size="2xl" weight="bold">
				{translator.t('overview.editors')}
			</Typography>
			<div className="mx-auto mt-6 grid max-w-2xl grid-cols-2 md:grid-cols-5">
				{blogAuthorsResponse.map((author, index) => (
					<div key={index} className="flex flex-col items-center text-center">
						<StoryblokAuthorImage author={author.content} size="extra-large" className="mb-2" />
						<Typography key={index + 'fn'}>{author.content.firstName}</Typography>
						<Typography key={index + 'ln'}>{author.content.lastName}</Typography>
					</div>
				))}
			</div>

			<div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{blogObjects.map((blog) => (
					<Link href={`/${lang}/${region}/${blog.default_full_slug!}`} key={blog.content.id}>
						<Card className="overflow-hidden transition-transform duration-300 hover:scale-[102%]">
							<Image
								src={blog.content.image.filename}
								alt={blog.content.title}
								width={600}
								height={400}
								className="h-48 w-full object-cover"
							/>
							<CardContent className="flex flex-grow flex-col p-6">
								<Typography size="xl" className="mb-4 line-clamp-2 h-14 flex-grow font-medium">
									{blog.content.title}
								</Typography>
								<div className="mt-auto flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<StoryblokAuthorImage author={blog.content.author.content} />
										<Typography>{blog.content.author.content.fullName}</Typography>
									</div>
									<Typography>{getPublishedDateFormatted(blog.published_at!)}</Typography>
								</div>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</BaseContainer>
	);
}
