CREATE TYPE "Currency" AS ENUM (
  'AED','AFN','ALL','AMD','ANG','AOA','ARS','AUD','AWG','AZN','BAM','BBD','BDT','BGN','BHD','BIF','BMD','BND',
  'BOB','BRL','BSD','BTC','BTN','BWP','BYN','BYR','BZD','CAD','CDF','CHF','CLF','CLP','CNY','COP','CRC','CUC',
  'CUP','CVE','CZK','DJF','DKK','DOP','DZD','EGP','ERN','ETB','EUR','FJD','FKP','FOK','GBP','GEL','GGP','GHS',
  'GIP','GMD','GNF','GTQ','GYD','HKD','HNL','HRK','HTG','HUF','IDR','ILS','IMP','INR','IQD','IRR','ISK','JEP',
  'JMD','JOD','JPY','KES','KGS','KHR','KID','KMF','KPW','KRW','KWD','KYD','KZT','LAK','LBP','LKR','LRD','LSL',
  'LTL','LYD','LVL','MAD','MDL','MGA','MKD','MMK','MNT','MOP','MRO','MUR','MVR','MWK','MXN','MYR','MZN','NAD',
  'NGN','NIO','NOK','NPR','NZD','OMR','PAB','PEN','PGK','PHP','PKR','PLN','PYG','QAR','RON','RSD','RUB','RWF',
  'SAR','SBD','SCR','SDG','SEK','SGD','SHP','SLE','SLL','SOS','SRD','SSP','STD','SVC','SYP','SZL','THB','TJS',
  'TMT','TND','TOP','TRY','TTD','TWD','TZS','UAH','UGX','USD','UYU','UZS','VEF','VES','VND','VUV','WST','XAF',
  'XAU','XAG','XCD','XDR','XOF','XPF','YER','ZAR','ZMK','ZMW','ZWL'
);

ALTER TABLE "contribution"
ALTER COLUMN "currency" TYPE "Currency"
USING ("currency"::"Currency");

ALTER TABLE "payout"
ALTER COLUMN "currency" TYPE "Currency"
USING ("currency"::"Currency");

ALTER TABLE "program"
ALTER COLUMN "payout_currency" TYPE "Currency"
USING ("payout_currency"::"Currency");

ALTER TABLE "campaign"
ALTER COLUMN "currency" TYPE "Currency"
USING ("currency"::"Currency");

ALTER TABLE "exchange_rate"
ALTER COLUMN "currency" TYPE "Currency"
USING ("currency"::"Currency");
