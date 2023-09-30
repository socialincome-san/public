import { setGlobalOptions } from 'firebase-functions/v2/options';
import { DEFAULT_REGION } from './config';

setGlobalOptions({ maxInstances: 10, region: DEFAULT_REGION });

export * from './cron/index';
export * from './firestore/index';
export * from './storage/index';
export * from './webhooks/index';
