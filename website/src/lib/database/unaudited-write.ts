/**
 * Technical writes that change no business entity, such as deleting a phone
 * row nothing references anymore. Lint allows writes on the shared Prisma
 * client only inside this wrapper and never for audited models. Add a reason
 * only after review; business changes belong in `withAudit`.
 */
export type UnauditedWriteReason = 'orphan-cleanup';

export const unauditedWrite = <T>(reason: UnauditedWriteReason, write: () => Promise<T>): Promise<T> => write();
