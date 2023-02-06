// Root paths. These paths are relative to the functions/dist/functions/src directory, which is the destination of the compilation of this file.
import * as path from 'path';

export const ASSET_DIR = path.join(__dirname, '..', '..', 'shared', 'assets');

// Env variables
export const STRIPE_API_READ_KEY = process.env.STRIPE_API_READ_KEY!;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export const POSTFINANCE_EMAIL_USER = process.env.POSTFINANCE_EMAIL_USER!;
export const POSTFINANCE_EMAIL_PASSWORD = process.env.POSTFINANCE_EMAIL_PASSWORD!;

export const NOTIFICATION_EMAIL_USER = process.env.NOTIFICATION_EMAIL_USER!;
export const NOTIFICATION_EMAIL_PASSWORD = process.env.NOTIFICATION_EMAIL_PASSWORD!;

export const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY!;
export const MAILCHIMP_SERVER = process.env.MAILCHIMP_SERVER!;
export const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID!;
