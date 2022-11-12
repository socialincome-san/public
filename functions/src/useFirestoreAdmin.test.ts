import {describe, test} from '@jest/globals';
import firebaseFunctionsTest from 'firebase-functions-test';
import {findFirst, doc} from "./useFirestoreAdmin";

const { cleanup } = firebaseFunctionsTest();

interface TestInterface {
	name: string
}

describe('useFirestoreAdmin', () => {
	afterEach(() => cleanup());

	test('findFirst', async () => {
		const collection = 'test-collection'
		const document = 'test-document'
		const name = 'test-name'
		const testDocument = {
			name
		}
		await doc<TestInterface>(collection, document).set(testDocument)
		const retrievedDocument = await findFirst<TestInterface>(collection, query => query.where('name', '==', name))
		expect(retrievedDocument!.data()).toEqual(testDocument);
	});

});
