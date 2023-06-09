import { FirestoreAuditor } from './FirestoreAuditor';

export const auditCollectionTrigger = new FirestoreAuditor().getFunction();
