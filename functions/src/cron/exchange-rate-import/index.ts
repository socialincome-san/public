import * as functions from 'firebase-functions';
import { DateTime } from 'luxon';
import { ExchangeRateImporter } from './ExchangeRateImporter';

/**
 * Function periodically scrapes currency exchange rates and saves them to firebase
 */
export default functions
	.runWith({
		timeoutSeconds: 540,
	})
	.pubsub.schedule('0 1 * * *')
	.onRun(async () => {
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
					functions.logger.error(`Could not ingest exchange rate`, error);
				}
			}
		}
	});
