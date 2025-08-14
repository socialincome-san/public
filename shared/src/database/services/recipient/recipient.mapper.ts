import { RecipientTableDbShape, RecipientTableFlatShape } from './recipient.types';

export class RecipientTableMapper {
	mapList(rows: RecipientTableDbShape[]): RecipientTableFlatShape[] {
		return rows.map((row) => this.mapOne(row));
	}

	mapOne(row: RecipientTableDbShape): RecipientTableFlatShape {
		const payoutsReceived = row.payoutsPaidCount ?? 0;
		const payoutsTotal = row.program?.totalPayments ?? 0;
		const payoutsProgressPercent = payoutsTotal > 0 ? Math.round((payoutsReceived / payoutsTotal) * 100) : 0;

		return {
			id: row.id,
			firstName: row.user?.firstName ?? '',
			lastName: row.user?.lastName ?? '',
			age: row.user?.birthDate ? this.calculateAge(row.user.birthDate) : null,
			status: row.status,
			localPartnerName: row.localPartner?.name ?? '',
			payoutsReceived,
			payoutsTotal,
			payoutsProgressPercent,
		};
	}

	private calculateAge(birthDate: Date): number {
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age;
	}
}
