import { blockMargins } from './block-margins';

describe('blockMargins', () => {
	it('falls back to the default margin when nothing is set', () => {
		expect(blockMargins({})).toEqual({ marginTop: undefined, marginBottom: undefined });
		expect(blockMargins({ marginTop: '', marginBottom: '' })).toEqual({ marginTop: undefined, marginBottom: undefined });
	});

	it('maps the old disable checkboxes to none', () => {
		expect(blockMargins({ disableMarginTop: true, disableMarginBottom: false })).toEqual({
			marginTop: 'none',
			marginBottom: undefined,
		});
	});

	it('prefers the new margin fields over the old checkboxes', () => {
		expect(blockMargins({ marginTop: 'sm', marginBottom: 'lg', disableMarginTop: true, disableMarginBottom: true })).toEqual(
			{ marginTop: 'sm', marginBottom: 'lg' },
		);
	});

	it('keeps the old checkbox when the new field is empty', () => {
		expect(blockMargins({ marginTop: '', disableMarginTop: true })).toEqual({ marginTop: 'none', marginBottom: undefined });
	});
});
