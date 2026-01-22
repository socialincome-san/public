export default async function globalSetup() {
	console.log('Starting global setup for E2E tests...');
	await new Promise((r) => setTimeout(r, 10000)); // wait for emulators to start
}
