import { DefaultPageProps } from '@/app/[lang]/[region]';
import {
	getAuthors,
	getPublishedDateFormatted,
	loadOverviewBlogs,
	loadTopics,
} from '@/app/[lang]/[region]/(website)/journal/StoryblokApi';
import StoryblokAuthorImage from '@/app/[lang]/[region]/(website)/journal/StoryblokAuthorImage';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import Image from 'next/image';
import Link from 'next/link';

export const revalidate = 900;

export default async function Page({ params: { lang, region } }: DefaultPageProps) {
	const [blogsResponse, authorsResponse, topicsResponse] = await Promise.all([
		loadOverviewBlogs(lang),
		getAuthors(lang),
		loadTopics(lang),
	]);
	const blogs = blogsResponse.data.stories;
	const authors = authorsResponse.data.stories;
	const topics = topicsResponse.data.stories;
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-journal'],
	});

	return (
		<BaseContainer>
			<Typography weight="bold" className="text-center" size="5xl">
				{translator.t('overview.title')}
			</Typography>
			<Typography className="mt-8 text-center text-black" size="xl">
				{translator.t('overview.description')}
			</Typography>
			<Typography className="mt-16 text-center" size="4xl" weight="medium">
				{translator.t('overview.editors')}
			</Typography>
			<div className="mx-auto mt-6 grid max-w-lg grid-cols-[repeat(auto-fit,minmax(60px,1fr))] place-items-center gap-2">
				{authors.map((author, index) => (
					<div key={index} className="flex flex-col justify-center text-center">
						<StoryblokAuthorImage author={author.content} size="extra-large" className="mb-1" />
						<Typography>{author.content.firstName}</Typography>
						<Typography>{author.content.lastName}</Typography>
					</div>
				))}
			</div>

			<div className="mt-16 flex justify-start gap-4">
				{topics.map((topic) => (
					<Typography weight="bold" key={topic.content.id} className="text-left uppercase">
						{topic.content.value}
					</Typography>
				))}
			</div>

			<div className="mt-5 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{blogs.map((blog) => (
					<Link href={`/${lang}/${region}/${blog.default_full_slug!}`} key={blog.content.id}>
						<div className="overflow-hidden transition-transform duration-300 hover:scale-[102%]">
							<Image
								src={blog.content.image.filename}
								alt={blog.content.title}
								width={600}
								height={400}
								className="h-48 w-full object-cover"
							/>
							<div className="mt-3 flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<Typography weight="bold" className="uppercase">
										{blog.content.topics[0].content.value}
									</Typography>
								</div>
								<Typography weight="normal" className="text-black">
									{getPublishedDateFormatted(blog.published_at!, lang)}
								</Typography>
							</div>

							<div className="mt-6 flex flex-grow flex-col">
								<Typography size="3xl" className="mb-4 line-clamp-2 h-20 flex-grow" weight="medium">
									{blog.content.title}
								</Typography>
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<StoryblokAuthorImage size="large" author={blog.content.author.content} />
										<Typography className="ml-1" size="lg">
											{blog.content.author.content.fullName}
										</Typography>
									</div>
								</div>
								<Typography size="md" weight="normal" className="mt-4 line-clamp-5 text-black">
									{blog.content.leadText}
								</Typography>
							</div>
						</div>
					</Link>
				))}
			</div>
		</BaseContainer>
	);
}
