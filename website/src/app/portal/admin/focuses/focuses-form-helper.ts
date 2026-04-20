/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { FocusFormCreateInput, FocusFormUpdateInput } from '@/lib/services/focus/focus-form-input';
import type { FocusPayload } from '@/lib/services/focus/focus.types';
import type { FocusFormSchema } from './focuses-form';

export const buildCreateFocusInput = (schema: FocusFormSchema): FocusFormCreateInput => {
	return {
		name: schema.fields.name.value,
	};
};

export const buildUpdateFocusInput = (schema: FocusFormSchema, focus: FocusPayload): FocusFormUpdateInput => {
	return {
		id: focus.id,
		name: schema.fields.name.value,
	};
};
