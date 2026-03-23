import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SaleItem, SaleCategory } from '../models/sale-item.model';
import { generateClient } from 'aws-amplify/api';

const client = generateClient();

const SALE_FIELDS = `id name description price category status seller images activities condition`;

@Injectable({ providedIn: 'root' })
export class SaleService {
  private itemsSubject = new BehaviorSubject<SaleItem[]>([]);
  items$: Observable<SaleItem[]> = this.itemsSubject.asObservable();

  readonly venmoUsername = 'Ryan-Williams-09432';
  readonly sellerToken = 'carlsride2026';

  readonly categories: { value: SaleCategory; label: string; emoji: string }[] = [
    { value: 'bikes',       label: 'Bikes',       emoji: '🚲' },
    { value: 'parts',       label: 'Parts',       emoji: '🔧' },
    { value: 'wheels',      label: 'Wheels',      emoji: '⭕' },
    { value: 'tires',       label: 'Tires',       emoji: '🏎️' },
    { value: 'tools',       label: 'Tools',       emoji: '🛠️' },
    { value: 'helmets',     label: 'Helmets',     emoji: '⛑️' },
    { value: 'clothing',    label: 'Clothing',    emoji: '👕' },
    { value: 'accessories', label: 'Accessories', emoji: '🎒' },
    { value: 'other',       label: 'Other',       emoji: '📦' },
  ];

  constructor() {
    this.loadItems();
  }

  private async loadItems(): Promise<void> {
    try {
      const result: any = await client.graphql({
        query: `query ListSaleItems { listSaleItems { items { ${SALE_FIELDS} } } }`
      });
      this.itemsSubject.next(result.data.listSaleItems.items);
    } catch (e) {
      console.warn('Could not load sale items from API.', e);
    }
  }

  async addItem(item: Omit<SaleItem, 'id' | 'status'>): Promise<SaleItem> {
    const input = { ...item, status: 'available' };
    const result: any = await client.graphql({
      query: `mutation CreateSaleItem($input: CreateSaleItemInput!) {
        createSaleItem(input: $input) { ${SALE_FIELDS} }
      }`,
      variables: { input }
    });
    const newItem = result.data.createSaleItem;
    this.itemsSubject.next([...this.itemsSubject.value, newItem]);
    return newItem;
  }

  async updateItem(id: string, changes: Partial<Omit<SaleItem, 'id'>>): Promise<void> {
    await client.graphql({
      query: `mutation UpdateSaleItem($input: UpdateSaleItemInput!) {
        updateSaleItem(input: $input) { ${SALE_FIELDS} }
      }`,
      variables: { input: { id, ...changes } }
    });
    this.itemsSubject.next(this.itemsSubject.value.map(i => i.id === id ? { ...i, ...changes } : i));
  }

  getItem(id: string): SaleItem | undefined {
    return this.itemsSubject.value.find(i => i.id === id);
  }

  markPending(id: string): void { this.updateItem(id, { status: 'pending' }); }
  markSold(id: string): void { this.updateItem(id, { status: 'sold' }); }
  markAvailable(id: string): void { this.updateItem(id, { status: 'available' }); }

  getVenmoUrl(item: SaleItem): string {
    return `https://venmo.com/${this.venmoUsername}?txn=pay&amount=${item.price}&note=${encodeURIComponent(item.name)}`;
  }
}
