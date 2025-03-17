import { setGlobalOptions } from 'firebase-functions/v2/options';
import { DEFAULT_REGION } from '../../shared/src/firebase';

setGlobalOptions({ maxInstances: 5, region: DEFAULT_REGION });

export * from './functions/cron/index';
export * from './functions/firestore/index';
export * from './functions/storage/index';
export * from './functions/webhooks/index';
