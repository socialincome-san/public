import { logger } from 'firebase-functions';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { DateTime } from 'luxon';
import { createDonationCertificates } from '../../../lib/donation-certificates';

export default onSchedule({ schedule: '0 0 2 1 *', memory: '4GiB' }, async () => {
	const now = DateTime.now();
	const msg = await createDonationCertificates({ year: now.year - 1 });
	logger.info(msg);
});
