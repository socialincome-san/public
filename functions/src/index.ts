import { dummyFunction as dummyFunc } from './dummy/dummyFunction';
import { importBalanceMailFunc } from './etl/importPostfinanceBalance';
import { stripeChargeSucceededHookFunc } from './etl/stripeWebhook';

export const importBalanceMail = importBalanceMailFunc;
export const stripeChargeSucceededHook = stripeChargeSucceededHookFunc;
export const dummyFunction = dummyFunc;
