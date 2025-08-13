import { RecipientTableDbShape, RecipientTableFlatShape } from './recipient.types';

export class RecipientTableMapper {
	mapList(rows: RecipientTableDbShape[]): RecipientTableFlatShape[] {
		return rows.map((r) => this.mapOne(r));
	}

	mapOne(r: RecipientTableDbShape): RecipientTableFlatShape {
		return {
			id: r.id,
			firstName: r.user?.firstName ?? '',
			lastName: r.user?.lastName ?? '',
			age: r.user?.birthDate ? this.calculateAge(r.user.birthDate) : null,
			status: r.status,
			localPartnerName: r.localPartner?.name ?? '',
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
