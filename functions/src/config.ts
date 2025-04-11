// Root paths. These paths are relative to the functions/dist/functions/src directory, which is the destination of the compilation of this file.
import 'dotenv/config';
import * as path from 'path';

export const ASSET_DIR = path.join(__dirname, '..', '..', 'shared', 'assets');

// Env variables
export const STRIPE_API_READ_KEY = process.env.STRIPE_API_READ_KEY!;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export const POSTFINANCE_PAYMENTS_FILES_BUCKET = process.env.POSTFINANCE_PAYMENTS_FILES_BUCKET!;
export const POSTFINANCE_FTP_RSA_PRIVATE_KEY_BASE64 = process.env.POSTFINANCE_FTP_RSA_PRIVATE_KEY_BASE64!;
export const POSTFINANCE_FTP_HOST = process.env.POSTFINANCE_FTP_HOST!;
export const POSTFINANCE_FTP_PORT = process.env.POSTFINANCE_FTP_PORT!;
export const POSTFINANCE_FTP_USER = process.env.POSTFINANCE_FTP_USER!;

export const EXCHANGE_RATES_API = process.env.EXCHANGE_RATES_API!;
