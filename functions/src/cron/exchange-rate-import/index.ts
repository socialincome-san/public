import { logger } from 'firebase-functions';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { DateTime } from 'luxon';
import { ExchangeRateImporter } from './ExchangeRateImporter';

/**
 * Function periodically scrapes currency exchange rates and saves them to firebase
 */
export default onSchedule('0 1 * * *', async () => {
	const exchangeRateImporter = new ExchangeRateImporter();
	const existingExchangeRates = await exchangeRateImporter.getAllExchangeRates();
	for (
		let timestamp = ExchangeRateImporter.startTimestamp;
		timestamp <= Date.now() / 1000;
		timestamp += ExchangeRateImporter.secondsInDay
	) {
		if (!existingExchangeRates.has(timestamp)) {
			try {
				await exchangeRateImporter.fetchAndStoreExchangeRates(DateTime.fromSeconds(timestamp));
			} catch (error) {
				logger.error(`Could not ingest exchange rate`, error);
			}
		}
	}
});
