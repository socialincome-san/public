import { dummyFunction as dummyFunc } from './dummy/dummyFunction';
import { sendMessagesFunction as sendMessagesFunc } from './messages/sendMessagesFunction';
import { importBalanceMailFunc } from './etl/importPostfinanceBalance';

export const importBalanceMail = importBalanceMailFunc;
export const dummyFunction = dummyFunc;
export const sendMessagesFunction = sendMessagesFunc;
