import { Prisma, PrismaClient } from '@prisma/client';
import { BaseImporter } from '../core/base.importer';
import { FirebaseAuthService } from '../core/firebase-auth.service';
import { ContributorCreateInput } from './contributor.types';

const prisma = new PrismaClient();
const firebaseAuth = new FirebaseAuthService();

export class ContributorImporter extends BaseImporter<ContributorCreateInput> {
	import = async (contributors: ContributorCreateInput[]): Promise<number> => {
		let createdCount = 0;
		let emailDuplicates = 0;
		let authDuplicates = 0;

		for (const data of contributors) {
			const email = data.contributor?.create?.contact?.create?.email ?? 'unknown';
			// If no firebaseAuthUserId is present, create (or fetch) a Firebase Auth user in the target project
			if (data.firebaseAuthUserId === 'create-manual-auth-user') {
				const displayName = [
					data.contributor?.create?.contact?.create?.firstName,
					data.contributor?.create?.contact?.create?.lastName,
				]
					.filter(Boolean)
					.join(' ');
				const result = await firebaseAuth.createOrGetUser(email, displayName || undefined);
				data.firebaseAuthUserId = result.uid;
				if (result.created) {
					console.log(`🔐 Created Firebase Auth user for ${email}, ${displayName} -> uid=${result.uid}`);
				} else {
					console.log(`🔁 Reused existing Firebase Auth user for ${email}, ${displayName} -> uid=${result.uid}`);
				}
			}

			const { emailAttempts, authAttempts } = await this.createAccountWithUniqueFields(data, email);
			createdCount++;
			emailDuplicates += emailAttempts;
			authDuplicates += authAttempts;
		}

		if (emailDuplicates > 0 || authDuplicates > 0) {
			console.log(
				`⚠️ ContributorImporter: handled ${emailDuplicates} duplicate email(s) and ${authDuplicates} duplicate firebase_auth_user_id(s).`,
			);
		}

		return createdCount;
	};

	/**
	 * Creates an account while ensuring unique email and firebase_auth_user_id
	 * by appending "-UNIQUE-n" suffixes when duplicates occur.
	 */
	private async createAccountWithUniqueFields(
		data: ContributorCreateInput,
		baseEmail: string,
	): Promise<{ emailAttempts: number; authAttempts: number }> {
		let email = baseEmail;
		let authId = data.firebaseAuthUserId ?? '';
		let emailAttempts = 0;
		let authAttempts = 0;

		while (true) {
			try {
				await prisma.account.create({ data });
				return { emailAttempts, authAttempts };
			} catch (error) {
				if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
					const targets = (error.meta?.target as string[]) ?? [];

					if (targets.includes('email')) {
						emailAttempts++;
						email = `${baseEmail}-UNIQUE-${emailAttempts}`;
						data.contributor!.create!.contact!.create!.email = email;
						continue;
					}

					if (targets.includes('firebase_auth_user_id')) {
						authAttempts++;
						authId = `${authId}-UNIQUE-${authAttempts}`;
						data.firebaseAuthUserId = authId;
						continue;
					}
				}

				throw error;
			}
		}
	}
}
