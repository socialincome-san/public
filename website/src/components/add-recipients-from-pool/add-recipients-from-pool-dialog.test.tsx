/** @jest-environment jsdom */

import { AddRecipientsFromPoolDialog } from '@/components/add-recipients-from-pool/add-recipients-from-pool-dialog';
import { CountryCode, Currency, PayoutInterval } from '@/generated/prisma/enums';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const resizeObserverNoop = () => undefined;

class ResizeObserverStub {
	observe = resizeObserverNoop;
	unobserve = resizeObserverNoop;
	disconnect = resizeObserverNoop;
}

globalThis.ResizeObserver = ResizeObserverStub;

const mockGetSetup = jest.fn<Promise<unknown>, [unknown]>();
const mockPreview = jest.fn<Promise<unknown>, [unknown]>();
const mockAssign = jest.fn<Promise<unknown>, [unknown]>();

jest.mock('next-intl', () => ({
	useTranslations: (namespace: string) => (key: string, values?: Record<string, number>) => {
		if (namespace === 'countries') {
			return key === 'SL' ? 'Sierra Leone' : key;
		}
		if (key === 'selection.targeted.matching') {
			return `${values?.matching ?? 0} of ${values?.total ?? 0} candidates match the current filters`;
		}
		if (key === 'terms.months') {
			return `${values?.count ?? 0} months`;
		}
		if (key === 'terms.interval.monthly') {
			return 'Monthly';
		}
		if (key === 'actions.continue') {
			return 'Continue';
		}
		if (key === 'actions.add') {
			return `Add ${values?.count ?? 0} recipient`;
		}
		if (key === 'error.generic') {
			return 'Recipients could not be added. Please try again.';
		}
		if (key === 'profiles.female') {
			return 'Female';
		}

		return key;
	},
}));

jest.mock('@/modules/programs/program.actions', () => ({
	getProgramRecipientPoolSetupAction: (programId: unknown) => mockGetSetup(programId),
	previewProgramRecipientPoolAction: (input: unknown) => mockPreview(input),
	assignProgramRecipientsFromPoolAction: (input: unknown) => mockAssign(input),
}));

const setup = {
	programId: 'program-1',
	countryCode: CountryCode.SL,
	programDurationInMonths: 12,
	payoutPerInterval: 600,
	payoutCurrency: Currency.SLE,
	payoutInterval: PayoutInterval.monthly,
	focusOptions: [{ id: 'focus-health', name: 'Health' }],
	localPartnerOptions: [{ id: 'partner-1', name: 'Partner' }],
	totalCount: 7,
};

const budget = {
	calculatedTotalBudget: 7200,
	displayMonthlyCost: 600,
	totalBudgetTooltipText: '',
	payoutPerIntervalMin: 1,
	payoutPerIntervalMax: 1,
};

const isPreviewInput = (
	input: unknown,
): input is { profiles?: string[]; localPartnerIds?: string[]; recipientCount?: number } =>
	typeof input === 'object' && input !== null;

const flush = async () => {
	await act(async () => {
		await new Promise((resolve) => setTimeout(resolve, 0));
	});
};

const buttonByText = (text: string) =>
	Array.from(document.body.querySelectorAll('button')).find((element) => element.textContent === text);

const click = async (element: Element | undefined) => {
	if (!element) {
		throw new Error('Missing element to click');
	}
	act(() => {
		element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
	});
	await flush();
};

describe('AddRecipientsFromPoolDialog', () => {
	let container: HTMLDivElement;
	let root: Root;
	const onOpenChange = jest.fn();
	const onAssigned = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		mockGetSetup.mockResolvedValue({ success: true, data: setup });
		mockPreview.mockImplementation((input: unknown) => {
			const selection = isPreviewInput(input) ? input : {};

			return Promise.resolve({
				success: true,
				data: {
					totalCount: 7,
					matchingCount: selection.localPartnerIds?.includes('partner-1')
						? 0
						: selection.profiles?.includes('female')
							? 2
							: 7,
					budget: selection.recipientCount === undefined ? null : budget,
				},
			});
		});
		mockAssign.mockResolvedValue({ success: true, data: { assigned: 2 } });
		container = document.createElement('div');
		document.body.appendChild(container);
		root = createRoot(container);
	});

	afterEach(() => {
		act(() => {
			root.unmount();
		});
		container.remove();
	});

	const renderDialog = async () => {
		act(() => {
			root.render(
				<AddRecipientsFromPoolDialog open programId="program-1" onOpenChange={onOpenChange} onAssigned={onAssigned} />,
			);
		});
		await flush();
	};

	test('shows the program country and payout terms without inputs for them', async () => {
		await renderDialog();
		await click(document.body.querySelector('[data-testid="radio-card-universal"]') ?? undefined);
		await click(buttonByText('Continue'));

		const country = document.body.querySelector('[data-testid="pool-country"]');

		expect(country?.textContent).toContain('Sierra Leone');
		expect(country?.querySelector('input, select, textarea')).toBeNull();
		expect(document.body.textContent).toContain('step3.payout_summary.program_duration');
		expect(document.body.textContent).toContain('12 common.months');
		expect(document.body.textContent).toContain('common.interval.monthly');
		expect(document.body.querySelector('[data-testid="customize-payouts-switch"]')).toBeNull();
		expect(document.body.querySelector('[data-testid="total-budget"]')?.textContent).toMatch(/^7.?200$/);
		expect(mockPreview).toHaveBeenLastCalledWith(expect.objectContaining({ recipientCount: 1, displayCurrency: 'CHF' }));
	});

	test('updates the matching count and disables continue when no candidates match', async () => {
		await renderDialog();
		await click(document.body.querySelector('[data-testid="radio-card-targeted"]') ?? undefined);
		await click(document.body.querySelector('[data-testid="pill-multi-select-female"]') ?? undefined);

		expect(document.body.textContent).toContain('2 of 7 candidates match the current filters');

		await click(document.body.querySelector('[data-testid="pill-multi-select-female"]') ?? undefined);
		await click(document.body.querySelector('[data-testid="pill-multi-select-partner-1"]') ?? undefined);

		expect(buttonByText('Continue')?.disabled).toBe(true);
	});

	test('clamps the requested quantity to the matching count', async () => {
		await renderDialog();
		await click(document.body.querySelector('[data-testid="radio-card-targeted"]') ?? undefined);
		await click(document.body.querySelector('[data-testid="pill-multi-select-female"]') ?? undefined);
		await click(buttonByText('Continue'));

		const input = document.body.querySelector('[data-testid="recipients-count-input"]');
		if (!(input instanceof HTMLInputElement)) {
			throw new Error('Quantity input missing');
		}

		act(() => {
			input.focus();
			const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
			descriptor?.set?.call(input, '99');
			input.dispatchEvent(new Event('input', { bubbles: true }));
		});
		act(() => {
			input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
		});
		await flush();

		expect(document.body.querySelector('[data-testid="recipients-count-input"]')).toHaveProperty('value', '2');
	});

	test('closes through the parent after a successful assignment', async () => {
		await renderDialog();
		await click(document.body.querySelector('[data-testid="radio-card-universal"]') ?? undefined);
		await click(buttonByText('Continue'));
		await click(buttonByText('Add 1 recipient'));

		expect(onAssigned).toHaveBeenCalledWith(2);
		expect(onOpenChange).not.toHaveBeenCalled();
		expect(document.body.querySelector('[data-testid="pool-error"]')).toBeNull();
	});

	test('keeps the dialog open and shows an error when assignment fails', async () => {
		mockAssign.mockResolvedValue({ success: false, error: 'Could not assign candidates' });
		await renderDialog();
		await click(document.body.querySelector('[data-testid="radio-card-universal"]') ?? undefined);
		await click(buttonByText('Continue'));
		await click(buttonByText('Add 1 recipient'));

		expect(onAssigned).not.toHaveBeenCalled();
		expect(onOpenChange).not.toHaveBeenCalled();
		expect(document.body.querySelector('[data-testid="pool-error"]')?.textContent).toBe(
			'Recipients could not be added. Please try again.',
		);
		expect(document.body.querySelector('[data-testid="pool-country"]')).not.toBeNull();
	});

	test('leaves the saving state when the assignment request rejects', async () => {
		mockAssign.mockRejectedValue(new Error('Network error'));
		await renderDialog();
		await click(document.body.querySelector('[data-testid="radio-card-universal"]') ?? undefined);
		await click(buttonByText('Continue'));
		await click(buttonByText('Add 1 recipient'));

		expect(document.body.querySelector('[data-testid="pool-error"]')?.textContent).toBe(
			'Recipients could not be added. Please try again.',
		);
		expect(buttonByText('Add 1 recipient')?.disabled).toBe(false);
	});

	test('recounts the pool after not enough candidates were available', async () => {
		mockAssign.mockResolvedValue({ success: false, error: 'Not enough candidates available' });
		await renderDialog();
		await click(document.body.querySelector('[data-testid="radio-card-universal"]') ?? undefined);
		await click(buttonByText('Continue'));
		const previewCalls = mockPreview.mock.calls.length;
		await click(buttonByText('Add 1 recipient'));

		expect(
			mockPreview.mock.calls
				.slice(previewCalls)
				.some(([input]) => isPreviewInput(input) && input.recipientCount === undefined),
		).toBe(true);
		expect(document.body.querySelector('[data-testid="pool-error"]')?.textContent).toBe('error.not_enough');
	});
});
