import { ExpenseType, Prisma } from '@prisma/client';
import { DEFAULT_ORGANIZATION } from '../../scripts/seed-defaults';
import { BaseTransformer } from '../core/base.transformer';
import { FirestoreExpense } from './expense.types';

export class ExpenseTransformer extends BaseTransformer<FirestoreExpense, Prisma.ExpenseCreateInput> {
	transform = async (input: FirestoreExpense[]): Promise<Prisma.ExpenseCreateInput[]> => {
		const transformed: Prisma.ExpenseCreateInput[] = [];

		for (const entry of input) {
			transformed.push({
				legacyFirestoreId: entry.id,
				type: this.mapType(entry.type),
				year: entry.year,
				amountChf: new Prisma.Decimal(entry.amount_chf ?? 0),
				organization: { connect: { name: DEFAULT_ORGANIZATION.name } },
			});
		}

		return transformed;
	};

	private mapType(type: string): ExpenseType {
		switch (type) {
			case 'account_fees':
				return ExpenseType.account_fees;
			case 'administrative':
				return ExpenseType.administrative;
			case 'delivery_fees':
				return ExpenseType.delivery_fees;
			case 'donation_fees':
				return ExpenseType.donation_fees;
			case 'exchange_rate_loss':
				return ExpenseType.exchange_rate_loss;
			case 'fundraising_advertising':
				return ExpenseType.fundraising_advertising;
			case 'staff':
				return ExpenseType.staff;
			default:
				if (process.env.FIREBASE_DATABASE_URL?.includes('staging')) {
					console.log(`💡 Unknown expense type "${type}" — falling back to "administrative" (staging only).`);
					return ExpenseType.administrative;
				}

				throw new Error(`Unknown expense type: ${type}`);
		}
	}
}
