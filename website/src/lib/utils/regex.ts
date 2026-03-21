export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const E164_OPTIONAL_PHONE_REGEX = /^$|^\+[1-9]\d{1,14}$/;
export const CAMPAIGN_SLUG_REGEX = /^[a-z0-9]+(?:[_-][a-z0-9]+)*$/;

export const TRAILING_SLASHES_REGEX = /\/+$/;
export const UNDERSCORE_REGEX = /_/g;
export const WHITESPACE_REGEX = /\s+/g;
export const NON_ALPHANUMERIC_DASH_REGEX = /[^a-z0-9]+/g;
export const LEADING_TRAILING_DASHES_REGEX = /^-+|-+$/g;
export const DATA_TABLE_FETCH_PREFIX_REGEX = /^Could not fetch [^:]+:\s*/i;

export const CSV_DOUBLE_QUOTES_REGEX = /"/g;
export const CSV_NEEDS_QUOTES_REGEX = /[",\n]/;

export const CAMEL_CASE_BOUNDARY_REGEX = /([a-z0-9])([A-Z])/g;
export const UNDERSCORE_DASH_SEQUENCE_REGEX = /[_-]+/g;
export const WHITESPACE_SPLIT_REGEX = /\s+/;
export const TITLE_CASE_UNDERSCORE_REGEX = /^_*(.)|_+(.)/g;
export const START_CHARACTER_REGEX = /^./;

export const WEBSITE_AUTH_CONFIRM_LOGIN_PATH_REGEX = /\/auth\/confirm-login\/?$/;
export const NEW_WEBSITE_CONFIRM_LOGIN_PATH_REGEX = /\/confirm-login\/?$/;

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const makeLanguagePrefixRegex = (language: string): RegExp => new RegExp(`^${escapeRegex(language)}(/|$)`, 'i');

export const makeNewWebsiteSlugPrefixRegex = (slug: string): RegExp => new RegExp(`^${escapeRegex(slug)}/`);
