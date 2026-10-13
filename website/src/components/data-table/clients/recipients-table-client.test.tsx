/** @jest-environment jsdom */

import { RecipientsTableClient } from '@/components/data-table/clients/recipients-table-client';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mockRefresh = jest.fn();

jest.mock('next/navigation', () => ({
	useRouter: () => ({ refresh: mockRefresh }),
	useSearchParams: () => ({ get: () => null }),
}));

jest.mock('next-intl', () => ({
	useTranslations: () => (key: string, values?: { count?: number }) =>
		key === 'success' ? `Added ${values?.count ?? 0} recipients` : key,
}));

jest.mock('@/modules/recipients/recipient.actions', () => ({
	downloadRecipientsCsvAction: jest.fn(),
	importRecipientsCsvAction: jest.fn(),
}));

jest.mock('@/components/data-table/clients/configured-data-table-client', () => ({
	ConfiguredDataTableClient: ({
		actionMenuItems,
	}: {
		actionMenuItems: { label: string; disabled?: boolean; onSelect: () => void }[];
	}) => (
		<div>
			{actionMenuItems.map((item) => (
				<button key={item.label} type="button" disabled={item.disabled} onClick={item.onSelect}>
					{item.label}
				</button>
			))}
		</div>
	),
}));

jest.mock('@/components/data-table/clients/recipient-dialog', () => ({
	RecipientDialog: ({ open }: { open: boolean }) => (open ? <div>Manual recipient dialog</div> : null),
}));

jest.mock('@/components/data-table/clients/csv-upload-dialog', () => ({
	CsvUploadDialog: () => null,
}));

jest.mock('@/components/add-recipients-from-pool/add-recipients-from-pool-dialog', () => ({
	AddRecipientsFromPoolDialog: ({ open, onAssigned }: { open: boolean; onAssigned: (assignedCount: number) => void }) =>
		open ? (
			<button type="button" onClick={() => onAssigned(2)}>
				Confirm pool assignment
			</button>
		) : null,
}));

const renderTable = (props: { programId?: string; readOnly?: boolean; sessionType?: 'user' | 'local-partner' }) => {
	const container = document.createElement('div');
	document.body.appendChild(container);
	const root = createRoot(container);
	act(() => {
		root.render(
			<RecipientsTableClient
				rows={[]}
				error={null}
				programId={props.programId}
				readOnly={props.readOnly}
				sessionType={props.sessionType}
			/>,
		);
	});

	return {
		container,
		root,
		unmount: () => {
			act(() => {
				root.unmount();
			});
			container.remove();
		},
	};
};

const clickButton = (container: HTMLElement, name: string) => {
	const button = Array.from(container.querySelectorAll('button')).find((element) => element.textContent === name);
	if (!button) {
		throw new Error(`Missing button ${name}`);
	}
	act(() => {
		button.click();
	});
};

describe('RecipientsTableClient pool assignment menu', () => {
	let mounted: ReturnType<typeof renderTable> | undefined;

	afterEach(() => {
		mounted?.unmount();
		mounted = undefined;
		document.body.innerHTML = '';
		mockRefresh.mockClear();
	});

	test('opens the existing manual dialog from the renamed menu item', () => {
		mounted = renderTable({ programId: 'program-1' });

		clickButton(mounted.container, 'Add new recipient manually');

		expect(mounted.container.textContent).toContain('Manual recipient dialog');
	});

	test('offers pool assignment only on an editable program recipients table and refreshes after success', () => {
		mounted = renderTable({ programId: 'program-1' });

		clickButton(mounted.container, 'Add recipients from pool');
		clickButton(mounted.container, 'Confirm pool assignment');

		expect(mockRefresh).toHaveBeenCalledTimes(1);
		expect(mounted.container.textContent).toContain('Added 2 recipients');
		expect(mounted.container.textContent).not.toContain('Confirm pool assignment');
	});

	test('hides pool assignment on the global recipients page', () => {
		mounted = renderTable({});

		expect(mounted.container.textContent).toContain('Add new recipient manually');
		expect(mounted.container.textContent).not.toContain('Add recipients from pool');
	});

	test('hides pool assignment and disables manual creation when the program is read-only', () => {
		mounted = renderTable({ programId: 'program-1', readOnly: true });

		const manual = Array.from(mounted.container.querySelectorAll('button')).find(
			(element) => element.textContent === 'Add new recipient manually',
		);

		expect(manual?.disabled).toBe(true);
		expect(mounted.container.textContent).not.toContain('Add recipients from pool');
	});

	test('hides recipient creation for a local partner session', () => {
		mounted = renderTable({ programId: 'program-1', sessionType: 'local-partner' });

		expect(mounted.container.textContent).not.toContain('Add new recipient manually');
		expect(mounted.container.textContent).not.toContain('Add recipients from pool');
	});
});
