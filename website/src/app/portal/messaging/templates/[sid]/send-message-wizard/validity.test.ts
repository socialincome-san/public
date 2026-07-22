import type { MessagingChannel } from '@/generated/prisma/client';
import type { MessagingRecipientType } from '@/lib/services/twilio/messaging/recipients/recipients.types';
import type { SelectionState } from '@/lib/services/twilio/messaging/recipients/selection.types';
import type {
	ParsedVariable,
	VariableAssignments,
} from '@/lib/services/twilio/messaging/twilio-templates/twilio-template.types';
import { canAdvanceFromStep, canAdvanceFromStep1, canAdvanceFromStep2, canAdvanceFromStep3 } from './validity';

const includeSelection = (ids: string[]): SelectionState => ({
	mode: 'include',
	ids: new Set(ids),
});

const allMatchingSelection = (excluded: string[] = []): SelectionState => ({
	mode: 'all-matching',
	search: '',
	filters: {},
	excludedIds: new Set(excluded),
});

describe('validity', () => {
	describe('canAdvanceFromStep1', () => {
		test('fails when type is null', () => {
			expect(canAdvanceFromStep1(null, 'sms')).toBe(false);
		});

		test('fails when channel is null', () => {
			expect(canAdvanceFromStep1('contributor', null)).toBe(false);
		});

		test('passes for each recipient type when channel is set', () => {
			const types: MessagingRecipientType[] = ['contributor', 'recipient', 'local-partner'];
			for (const t of types) {
				expect(canAdvanceFromStep1(t, 'sms')).toBe(true);
			}
		});

		test('step 1: requires both type and channel', () => {
			const channels: MessagingChannel[] = ['sms', 'whatsapp'];
			for (const c of channels) {
				expect(canAdvanceFromStep1('contributor', c)).toBe(true);
			}
		});
	});

	describe('canAdvanceFromStep2', () => {
		test('fails when include-selection is empty', () => {
			expect(canAdvanceFromStep2(includeSelection([]), 100)).toBe(false);
		});

		test('passes when include-selection has at least one id', () => {
			expect(canAdvanceFromStep2(includeSelection(['a']), 100)).toBe(true);
		});

		test('passes for all-matching with no excludes when totalCount > 0', () => {
			expect(canAdvanceFromStep2(allMatchingSelection(), 5)).toBe(true);
		});

		test('fails for all-matching when totalCount is 0', () => {
			expect(canAdvanceFromStep2(allMatchingSelection(), 0)).toBe(false);
		});

		test('fails for all-matching when every row is excluded', () => {
			expect(canAdvanceFromStep2(allMatchingSelection(['a', 'b', 'c']), 3)).toBe(false);
		});
	});

	describe('canAdvanceFromStep3', () => {
		const variables: ParsedVariable[] = [
			{ key: 'first_name', exampleValue: 'Ada' },
			{ key: 'amount', exampleValue: '100' },
		];

		test('passes when variables list is empty', () => {
			expect(canAdvanceFromStep3([], {})).toBe(true);
		});

		test('fails when any variable is unassigned', () => {
			const assignments: VariableAssignments = {
				first_name: { source: 'field', path: 'contact.firstName' },
			};
			expect(canAdvanceFromStep3(variables, assignments)).toBe(false);
		});

		test('fails when a field assignment has empty path', () => {
			const assignments: VariableAssignments = {
				first_name: { source: 'field', path: '' },
				amount: { source: 'constant', value: '100' },
			};
			expect(canAdvanceFromStep3(variables, assignments)).toBe(false);
		});

		test('fails when a constant assignment has empty value', () => {
			const assignments: VariableAssignments = {
				first_name: { source: 'field', path: 'contact.firstName' },
				amount: { source: 'constant', value: '' },
			};
			expect(canAdvanceFromStep3(variables, assignments)).toBe(false);
		});

		test('passes when every variable has a non-empty assignment', () => {
			const assignments: VariableAssignments = {
				first_name: { source: 'field', path: 'contact.firstName' },
				amount: { source: 'constant', value: '100' },
			};
			expect(canAdvanceFromStep3(variables, assignments)).toBe(true);
		});
	});

	describe('canAdvanceFromStep dispatcher', () => {
		const validArgs = {
			type: 'recipient' as MessagingRecipientType,
			channel: 'sms' as MessagingChannel,
			selection: includeSelection(['a']),
			totalCount: 5,
			variables: [] as ParsedVariable[],
			assignments: {} as VariableAssignments,
		};

		test('routes to step 1 gate', () => {
			expect(canAdvanceFromStep(1, { ...validArgs, type: null })).toBe(false);
			expect(canAdvanceFromStep(1, { ...validArgs, channel: null })).toBe(false);
			expect(canAdvanceFromStep(1, validArgs)).toBe(true);
		});

		test('routes to step 2 gate', () => {
			expect(canAdvanceFromStep(2, { ...validArgs, selection: includeSelection([]) })).toBe(false);
			expect(canAdvanceFromStep(2, validArgs)).toBe(true);
		});

		test('routes to step 3 gate', () => {
			expect(canAdvanceFromStep(3, validArgs)).toBe(true);
		});

		test('step 4 always returns false (Send disabled in this scope)', () => {
			expect(canAdvanceFromStep(4, validArgs)).toBe(false);
		});
	});
});
