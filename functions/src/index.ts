import { setGlobalOptions } from 'firebase-functions/v2/options';

setGlobalOptions({ maxInstances: 10 });

export * from './cron/index';
export * from './firestore/index';
export * from './storage/index';
export * from './webhooks/index';
