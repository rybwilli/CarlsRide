import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ItemShowingEvent } from '../models/item-showing.model';
import { generateClient } from 'aws-amplify/api';

const client = generateClient();
const FIELDS = `id saleId dateTime location details contactName contactEmail`;

@Injectable({ providedIn: 'root' })
export class ItemShowingService {
  private showingsSubject = new BehaviorSubject<ItemShowingEvent[]>([]);
  showings$: Observable<ItemShowingEvent[]> = this.showingsSubject.asObservable();

  async loadShowings(): Promise<void> {
    try {
      const result: any = await client.graphql({
        query: `query ListItemShowingEvents { listItemShowingEvents { items { ${FIELDS} } } }`
      });
      this.showingsSubject.next(result.data.listItemShowingEvents.items);
    } catch (e) {
      console.warn('Could not load showings.', e);
    }
  }

  showingsForSale(saleId: string): ItemShowingEvent[] {
    return this.showingsSubject.value.filter(s => s.saleId === saleId);
  }

  async createShowing(input: Omit<ItemShowingEvent, 'id'>): Promise<void> {
    try {
      const result: any = await client.graphql({
        query: `mutation CreateItemShowingEvent($input: CreateItemShowingEventInput!) {
          createItemShowingEvent(input: $input) { ${FIELDS} }
        }`,
        variables: { input }
      });
      const created = result.data.createItemShowingEvent;
      this.showingsSubject.next([...this.showingsSubject.value, created]);
    } catch (e) {
      console.warn('Could not create showing.', e);
    }
  }

  async updateShowing(id: string, changes: Partial<Omit<ItemShowingEvent, 'id'>>): Promise<void> {
    try {
      const result: any = await client.graphql({
        query: `mutation UpdateItemShowingEvent($input: UpdateItemShowingEventInput!) {
          updateItemShowingEvent(input: $input) { ${FIELDS} }
        }`,
        variables: { input: { id, ...changes } }
      });
      const updated = result.data.updateItemShowingEvent;
      this.showingsSubject.next(this.showingsSubject.value.map(s => s.id === id ? updated : s));
    } catch (e) {
      console.warn('Could not update showing.', e);
    }
  }

  async deleteShowing(id: string): Promise<void> {
    try {
      await client.graphql({
        query: `mutation DeleteItemShowingEvent($input: DeleteItemShowingEventInput!) {
          deleteItemShowingEvent(input: $input) { id }
        }`,
        variables: { input: { id } }
      });
      this.showingsSubject.next(this.showingsSubject.value.filter(s => s.id !== id));
    } catch (e) {
      console.warn('Could not delete showing.', e);
    }
  }
}
