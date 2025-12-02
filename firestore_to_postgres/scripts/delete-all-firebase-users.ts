import 'dotenv/config';
import { FirebaseAuthService } from '../src/core/firebase-auth.service';

const main = async (): Promise<void> => {
	try {
		const firebaseAuth = new FirebaseAuthService();

		await firebaseAuth.deleteAllUsers();
	} catch (err) {
		console.log('❌ Deleting Firebase users failed:', err);
		process.exit(1);
	}
};

main();
