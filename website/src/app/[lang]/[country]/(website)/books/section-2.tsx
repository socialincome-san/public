import { DefaultPageProps } from '@/app/[lang]/[country]';
import Book from '@/components/book/book';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer } from '@socialincome/ui';
import book6cover from './better.jpg';
import book5cover from './coming.jpg';
import book2cover from './divide.jpg';
import book7cover from './freedom.jpg';
import book4cover from './hard.jpg';
import book1cover from './life.jpg';
import book8cover from './lowrey.jpg';
import book9cover from './poor-economics.jpg';
import book3cover from './utopia.jpg';

export default async function Section2({ params }: DefaultPageProps) {
	const translator = await Translator.getInstance({
		language: params.lang,
		namespaces: ['website-books'],
	});

	return (
		<BaseContainer>
			<div className="flex w-full flex-col-reverse items-center sm:items-start">
				<Book
					cover={book1cover}
					author={translator.t('section-2.book-1.author')}
					authorLink={translator.t('section-2.book-1.authorLink')}
					title={translator.t('section-2.book-1.title')}
					description={translator.t('section-2.book-1.description')}
					quote={translator.t('section-2.book-1.quote')}
					publisher={translator.t('section-2.book-1.publisher')}
					publisherLink={translator.t('section-2.book-1.publisherLink')}
					year={translator.t('section-2.book-1.year')}
				/>
				<Book
					cover={book2cover}
					author={translator.t('section-2.book-2.author')}
					authorLink={translator.t('section-2.book-2.authorLink')}
					title={translator.t('section-2.book-2.title')}
					description={translator.t('section-2.book-2.description')}
					quote={translator.t('section-2.book-2.quote')}
					publisher={translator.t('section-2.book-2.publisher')}
					publisherLink={translator.t('section-2.book-2.publisherLink')}
					year={translator.t('section-2.book-2.year')}
				/>
				<Book
					cover={book3cover}
					author={translator.t('section-2.book-3.author')}
					authorLink={translator.t('section-2.book-3.authorLink')}
					title={translator.t('section-2.book-3.title')}
					description={translator.t('section-2.book-3.description')}
					quote={translator.t('section-2.book-3.quote')}
					publisher={translator.t('section-2.book-3.publisher')}
					publisherLink={translator.t('section-2.book-3.publisherLink')}
					year={translator.t('section-2.book-3.year')}
				/>
				<Book
					cover={book4cover}
					author={translator.t('section-2.book-4.author')}
					authorLink={translator.t('section-2.book-4.authorLink')}
					title={translator.t('section-2.book-4.title')}
					description={translator.t('section-2.book-4.description')}
					quote={translator.t('section-2.book-4.quote')}
					publisher={translator.t('section-2.book-4.publisher')}
					publisherLink={translator.t('section-2.book-4.publisherLink')}
					year={translator.t('section-2.book-4.year')}
				/>
				<Book
					cover={book5cover}
					author={translator.t('section-2.book-5.author')}
					authorLink={translator.t('section-2.book-5.authorLink')}
					title={translator.t('section-2.book-5.title')}
					description={translator.t('section-2.book-5.description')}
					quote={translator.t('section-2.book-5.quote')}
					publisher={translator.t('section-2.book-5.publisher')}
					publisherLink={translator.t('section-2.book-5.publisherLink')}
					year={translator.t('section-2.book-5.year')}
				/>
				<Book
					cover={book6cover}
					author={translator.t('section-2.book-6.author')}
					authorLink={translator.t('section-2.book-6.authorLink')}
					title={translator.t('section-2.book-6.title')}
					description={translator.t('section-2.book-6.description')}
					quote={translator.t('section-2.book-6.quote')}
					publisher={translator.t('section-2.book-6.publisher')}
					publisherLink={translator.t('section-2.book-6.publisherLink')}
					year={translator.t('section-2.book-6.year')}
				/>
				<Book
					cover={book7cover}
					author={translator.t('section-2.book-7.author')}
					authorLink={translator.t('section-2.book-7.authorLink')}
					title={translator.t('section-2.book-7.title')}
					description={translator.t('section-2.book-7.description')}
					quote={translator.t('section-2.book-7.quote')}
					publisher={translator.t('section-2.book-7.publisher')}
					publisherLink={translator.t('section-2.book-7.publisherLink')}
					year={translator.t('section-2.book-7.year')}
				/>
				<Book
					cover={book8cover}
					author={translator.t('section-2.book-8.author')}
					authorLink={translator.t('section-2.book-8.authorLink')}
					title={translator.t('section-2.book-8.title')}
					description={translator.t('section-2.book-8.description')}
					quote={translator.t('section-2.book-8.quote')}
					publisher={translator.t('section-2.book-8.publisher')}
					publisherLink={translator.t('section-2.book-8.publisherLink')}
					year={translator.t('section-2.book-8.year')}
				/>
				<Book
					cover={book9cover}
					author={translator.t('section-2.book-9.author')}
					authorLink={translator.t('section-2.book-9.authorLink')}
					title={translator.t('section-2.book-9.title')}
					description={translator.t('section-2.book-9.description')}
					quote={translator.t('section-2.book-9.quote')}
					publisher={translator.t('section-2.book-9.publisher')}
					publisherLink={translator.t('section-2.book-9.publisherLink')}
					year={translator.t('section-2.book-9.year')}
					currentlyReading={true}
				/>
			</div>
		</BaseContainer>
	);
}
