// The client and admin sdks use different types for Timestamp. This is a workaround to unify them.
// See: https://github.com/firebase/firebase-admin-node/issues/1404

import { Timestamp as FirestoreTimestamp } from 'firebase/firestore';
export type Timestamp = Omit<FirestoreTimestamp, 'toJSON'>;
