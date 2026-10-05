/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { FocusCreateInput, FocusUpdateInput } from '@/modules/focuses/focus.schemas';
import type { FocusPayload } from '@/modules/focuses/focus.types';
import type { FocusFormSchema } from './focuses-form';

export const buildCreateFocusInput = (schema: FocusFormSchema): FocusCreateInput => {
	return {
		name: schema.fields.name.value,
		slug: schema.fields.slug.value,
	};
};

export const buildUpdateFocusInput = (schema: FocusFormSchema, focus: FocusPayload): FocusUpdateInput => {
	return {
		id: focus.id,
		name: schema.fields.name.value,
		slug: schema.fields.slug.value,
	};
};
