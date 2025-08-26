export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; status?: number };
