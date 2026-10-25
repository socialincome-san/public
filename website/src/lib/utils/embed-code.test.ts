import { parseEmbedCode } from './embed-code';

describe('parseEmbedCode', () => {
	it('reads the URL and height from a Google Calendar embed, ignoring the height in the URL', () => {
		const code =
			'<iframe src="https://calendar.google.com/calendar/embed?height=600&amp;ctz=Europe%2FZurich&mode=MONTH" style="border-width:0" width="800" height="600" frameborder="0" scrolling="no"></iframe>';

		expect(parseEmbedCode(code)).toEqual({
			src: 'https://calendar.google.com/calendar/embed?height=600&ctz=Europe%2FZurich&mode=MONTH',
			title: '',
			hostname: 'calendar.google.com',
			height: 600,
		});
	});

	it('reads single-quoted attributes from a World Bank embed', () => {
		const code =
			"<iframe src='https://dataembed.worldbank.org/data360/embed?view=map&indicatorID=WB_WDI_SL_TLF_CACT_FE_ZS' width='450' height='620' frameBorder='0' scrolling=\"yes\" allow=\"fullscreen\" allowFullScreen></iframe>";

		expect(parseEmbedCode(code)).toEqual({
			src: 'https://dataembed.worldbank.org/data360/embed?view=map&indicatorID=WB_WDI_SL_TLF_CACT_FE_ZS',
			title: '',
			hostname: 'dataembed.worldbank.org',
			height: 620,
		});
	});

	it('accepts a plain URL and leaves the height to the default ratio', () => {
		expect(parseEmbedCode('  https://player.vimeo.com/video/1 ')).toEqual({
			src: 'https://player.vimeo.com/video/1',
			title: '',
			hostname: 'player.vimeo.com',
			height: undefined,
		});
	});

	it.each(['filter=age>18', 'filter=age&gt;18'])('keeps %s in the URL', (query) => {
		expect(
			parseEmbedCode(`<iframe src="https://calendar.google.com/calendar/embed?${query}" height="600"></iframe>`),
		).toEqual({
			src: 'https://calendar.google.com/calendar/embed?filter=age%3E18',
			title: '',
			hostname: 'calendar.google.com',
			height: 600,
		});
	});

	it('reads the title from the code', () => {
		expect(parseEmbedCode('<iframe title=" Event calendar " src="https://example.org"></iframe>')?.title).toBe(
			'Event calendar',
		);
	});

	it('ignores relative heights', () => {
		expect(parseEmbedCode('<iframe src="https://example.org" height="100%"></iframe>')?.height).toBeUndefined();
	});

	it.each([
		undefined,
		'',
		'<script>alert(1)</script>',
		'<iframe src="javascript:alert(1)"></iframe>',
		'<iframe src="http://example.org"></iframe>',
		'not a url',
	])('rejects %p', (code) => {
		expect(parseEmbedCode(code)).toBeNull();
	});
});
