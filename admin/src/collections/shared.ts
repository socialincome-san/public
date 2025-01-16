import { DocumentData, UpdateData } from '@firebase/firestore';
import { getAuth } from 'firebase/auth';
import { DocumentReference, updateDoc } from 'firebase/firestore';
import { EntityOnSaveProps, buildCollection } from 'firecms';
import { EntityCollection, User } from 'firecms/dist/types';

/**
 * Use this instead of buildAuditedCollection to append a "last updated at" & "last updated by" column.
 * We use this replacement for all collections exposed in the admin to enable a history of all edits.
 * @param collection
 */
export const buildAuditedCollection = <
	M extends Record<string, any> = any,
	AdditionalKey extends string = string,
	UserType extends User = User,
>(
	collection: EntityCollection<M, AdditionalKey, UserType>,
): EntityCollection<M, AdditionalKey, UserType> => {
	collection.properties = {
		...collection.properties,
		// Will be populated by a firestore trigger to enforce correctness
		last_updated_at: {
			name: 'Last updated on',
			dataType: 'date',
			mode: 'date_time',
			readOnly: true,
			hideFromCollection: true,
		},
		// Is populated by the client onPreSave callback.
		// This is unfortunately required because the firestore triggers don't contain the triggering auth context.
		// https://github.com/firebase/firebase-functions/issues/300#issuecomment-611814916
		last_updated_by: {
			name: 'Last updated by',
			dataType: 'string',
			readOnly: true,
			hideFromCollection: true,
		},
	};

	// cloning the potentially configured onPreSave callback.
	// required to avoid an infinite recursion loop when calling it in the modified one below.s
	const delegateOnPreSave = collection.callbacks?.onPreSave
		? collection.callbacks?.onPreSave.bind({})
		: (saveProps: EntityOnSaveProps<M, User>) => Promise.resolve(saveProps.values);

	collection.callbacks = {
		...collection.callbacks,
		onPreSave: async (saveProps) => {
			// execute the potentially configured onPreSave callback
			const delegatedValues = await delegateOnPreSave(saveProps);
			// @ts-ignore the last_updated_by is implicitly appended here and is not part of the record M.
			delegatedValues.last_updated_by = saveProps.context.authController.user?.email;
			return delegatedValues;
		},
	};
	return buildCollection(collection);
};

export function auditedUpdateDoc<AppModelType, DbModelType extends DocumentData>(
	reference: DocumentReference<AppModelType, DbModelType>,
	data: UpdateData<DbModelType>,
) {
	const auth = getAuth();
	return updateDoc<AppModelType, DbModelType>(reference, { ...data, last_updated_by: auth.currentUser?.email });
}
