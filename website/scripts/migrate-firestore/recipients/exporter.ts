import { FireStoreRecipient } from './firestore-type';

export class Exporter {
  public export(): Promise<FireStoreRecipient[]> {
    return Promise.resolve([{ firstName: 'Hans' }, { firstName: 'Vreni' }]);
  }
}
