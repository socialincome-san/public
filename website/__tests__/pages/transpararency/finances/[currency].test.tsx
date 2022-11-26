import { render } from '@testing-library/react';
import Finances from '../../../../pages/transparency/finances/[currency]';

describe('Finance page should', () => {
	it('render page unchanged', async () => {
		const { container } = render(<Finances currency={'CHF'} balance={200} />);
		expect(container).toMatchSnapshot();
	});
});
