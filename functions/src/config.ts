// Root paths. These paths are relative to the functions/dist/functions/src directory, which is the destination of the compilation of this file.
import 'dotenv/config';
import * as path from 'path';

export const ASSET_DIR = path.join(__dirname, '..', '..', 'shared', 'assets');

// Env variables
export const STRIPE_API_READ_KEY = process.env.STRIPE_API_READ_KEY!;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export const POSTFINANCE_EMAIL_USER = process.env.POSTFINANCE_EMAIL_USER!;
export const POSTFINANCE_EMAIL_PASSWORD = process.env.POSTFINANCE_EMAIL_PASSWORD!;

export const POSTFINANCE_PAYMENTS_FILES_BUCKET = process.env.POSTFINANCE_PAYMENTS_FILES_BUCKET!;

export const NOTIFICATION_EMAIL_USER = process.env.NOTIFICATION_EMAIL_USER!;
export const NOTIFICATION_EMAIL_PASSWORD = process.env.NOTIFICATION_EMAIL_PASSWORD!;
export const NOTIFICATION_EMAIL_USER_KERRIN = process.env.NOTIFICATION_EMAIL_USER_KERRIN!;
export const NOTIFICATION_EMAIL_PASSWORD_KERRIN = process.env.NOTIFICATION_EMAIL_PASSWORD_KERRIN!;

export const TWILIO_SID = process.env.TWILIO_SID!;
export const TWILIO_TOKEN = process.env.TWILIO_TOKEN!;
export const TWILIO_SENDER_PHONE = process.env.TWILIO_SENDER_PHONE!;

export const EXCHANGE_RATES_API = process.env.EXCHANGE_RATES_API!;
