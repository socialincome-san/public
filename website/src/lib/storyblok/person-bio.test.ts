import { getBioSegments, splitFirstSentence } from './person-bio';

const text = (value: string, href?: string) => ({
	type: 'text',
	text: value,
	...(href ? { marks: [{ type: 'bold' }, { type: 'link', attrs: { href } }] } : {}),
});
const paragraph = (...content: unknown[]) => ({ type: 'paragraph', content });
const doc = (...content: unknown[]) => ({ type: 'doc', content });

describe('getBioSegments', () => {
	it('reads a plain string, as saved before the field became rich text', () => {
		expect(getBioSegments('  Founder of\n Social Income. ')).toEqual([{ text: 'Founder of Social Income.' }]);
	});

	it('keeps the links of a rich text and runs its paragraphs on', () => {
		const bio = doc(
			paragraph(text('Ada wrote '), text('the first program', '/pages/journal/first-program'), text('.')),
			paragraph(text('She joined in 2021.')),
		);

		expect(getBioSegments(bio)).toEqual([
			{ text: 'Ada wrote ' },
			{ text: 'the first program', href: '/pages/journal/first-program' },
			{ text: '. She joined in 2021.' },
		]);
	});

	it('reads anything else an editor pasted in as plain text', () => {
		const bio = doc(
			{ type: 'heading', attrs: { level: 2 }, content: [text('About')] },
			{ type: 'bullet_list', content: [{ type: 'list_item', content: [paragraph(text('One'))] }] },
			{ type: 'blok', attrs: { body: [] } },
		);

		expect(getBioSegments(bio)).toEqual([{ text: 'About One' }]);
	});

	it.each([undefined, null, '', '   ', doc(), doc(paragraph()), 42])('has nothing for an empty bio (%p)', (bio) => {
		expect(getBioSegments(bio)).toEqual([]);
	});
});

describe('splitFirstSentence', () => {
	it('keeps a bio of one sentence together', () => {
		const segments = [{ text: 'Founder of Social Income.' }];

		expect(splitFirstSentence(segments)).toEqual({ lead: segments, rest: [] });
	});

	it('splits after the first sentence', () => {
		expect(splitFirstSentence([{ text: 'Ada leads the programs. She joined in 2021. She lives in Bern.' }])).toEqual({
			lead: [{ text: 'Ada leads the programs.' }],
			rest: [{ text: 'She joined in 2021. She lives in Bern.' }],
		});
	});

	it('splits inside a link when the sentence ends there', () => {
		const segments = [{ text: 'Ada wrote ' }, { text: 'the program. And more', href: '/program' }, { text: ' later.' }];

		expect(splitFirstSentence(segments)).toEqual({
			lead: [{ text: 'Ada wrote ' }, { text: 'the program.', href: '/program' }],
			rest: [{ text: 'And more', href: '/program' }, { text: ' later.' }],
		});
	});

	it('does not split at a dot inside a word or number', () => {
		expect(splitFirstSentence([{ text: 'Ada gives 1.5 days a week to socialincome.org and more. Really.' }]).lead).toEqual([
			{ text: 'Ada gives 1.5 days a week to socialincome.org and more.' },
		]);
	});

	it('keeps a closing quote with its sentence', () => {
		expect(splitFirstSentence([{ text: 'She says "it works." And it does.' }]).lead).toEqual([
			{ text: 'She says "it works."' },
		]);
	});
});
