import { setGlobalOptions } from 'firebase-functions/v2/options';
import { DEFAULT_REGION } from '../../shared/src/firebase';

setGlobalOptions({ maxInstances: 1000, region: DEFAULT_REGION });

export * from './cron/index';
export * from './firestore/index';
export * from './storage/index';
export * from './webhooks/index';
