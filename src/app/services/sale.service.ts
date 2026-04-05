import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SaleItem, SaleCategory, SaleActivity, SaleCondition, SaleItemStatus } from '../models/sale-item.model';
import { SaleCatalogService } from './sale-catalog.service';
import { generateClient } from 'aws-amplify/api';

const client = generateClient();

const SALE_FIELDS = `id saleId name description price category status seller images activities condition comparableSite allowMultipleSales highPrice additionalListingUrl`;

@Injectable({ providedIn: 'root' })
export class SaleService {
  private itemsSubject = new BehaviorSubject<SaleItem[]>([]);
  items$: Observable<SaleItem[]> = this.itemsSubject.asObservable();

  categoryFilter: SaleCategory | 'all' = 'all';
  activityFilter: SaleActivity | 'all' = 'all';
  conditionFilter: SaleCondition | 'all' = 'all';
  statusFilter: SaleItemStatus | 'all' = 'all';

  readonly venmoUsername = 'Lrladwig';
  readonly sellerToken = 'carlsride2026';

  readonly categories: { value: SaleCategory; label: string; emoji: string }[] = [
    { value: 'bikes',       label: 'Bikes',       emoji: '🚲' },
    { value: 'parts',       label: 'Parts',       emoji: '🔧' },
    { value: 'wheels',      label: 'Wheels',      emoji: '⭕' },
    { value: 'tires',       label: 'Tires',       emoji: '🏎️' },
    { value: 'tools',       label: 'Tools',       emoji: '🛠️' },
    { value: 'helmets',     label: 'Helmets',     emoji: '⛑️' },
    { value: 'clothing',      label: 'Clothing',     emoji: '👕' },
    { value: 'shoes',         label: 'Shoes',        emoji: '👟' },
    { value: 'tents',         label: 'Tents',        emoji: '⛺' },
    { value: 'outdoor gear',  label: 'Outdoor Gear', emoji: '🏕️' },
    { value: 'accessories',   label: 'Accessories',  emoji: '🎒' },
    { value: 'other',         label: 'Other',        emoji: '📦' },
  ];

  constructor(private saleCatalogService: SaleCatalogService) {
    this.saleCatalogService.loadOrCreateSale().then(() => this.loadItems());
  }

  private async loadItems(): Promise<void> {
    const saleId = this.saleCatalogService.activeSale?.id;
    if (!saleId) return;
    try {
      // Fetch items for the active sale and items with no saleId in parallel
      const [saleItems, unlinkedItems] = await Promise.all([
        this.fetchBySaleId(saleId),
        this.fetchUnlinkedItems(),
      ]);
      this.itemsSubject.next([...saleItems, ...unlinkedItems]);
    } catch (e) {
      console.warn('Could not load sale items from API.', e);
    }
  }

  private async fetchBySaleId(saleId: string): Promise<SaleItem[]> {
    let items: SaleItem[] = [];
    let nextToken: string | null = null;
    do {
      const result: any = await client.graphql({
        query: `query SaleItemsBySaleId($saleId: ID!, $nextToken: String) {
          saleItemsBySaleId(saleId: $saleId, limit: 1000, nextToken: $nextToken) {
            items { ${SALE_FIELDS} }
            nextToken
          }
        }`,
        variables: { saleId, nextToken }
      });
      items = items.concat(result.data.saleItemsBySaleId.items);
      nextToken = result.data.saleItemsBySaleId.nextToken;
    } while (nextToken);
    return items;
  }

  private async fetchUnlinkedItems(): Promise<SaleItem[]> {
    let items: SaleItem[] = [];
    let nextToken: string | null = null;
    do {
      const result: any = await client.graphql({
        query: `query ListUnlinkedSaleItems($nextToken: String) {
          listSaleItems(filter: { saleId: { attributeExists: false } }, limit: 1000, nextToken: $nextToken) {
            items { ${SALE_FIELDS} }
            nextToken
          }
        }`,
        variables: { nextToken }
      });
      items = items.concat(result.data.listSaleItems.items);
      nextToken = result.data.listSaleItems.nextToken;
    } while (nextToken);
    return items;
  }

  async addItem(item: Omit<SaleItem, 'id' | 'status'>): Promise<SaleItem> {
    const input = { ...item, status: 'available', saleId: item.saleId ?? this.saleCatalogService.activeSale.id };
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

  async deleteItem(id: string): Promise<void> {
    await client.graphql({
      query: `mutation DeleteSaleItem($input: DeleteSaleItemInput!) {
        deleteSaleItem(input: $input) { id }
      }`,
      variables: { input: { id } }
    });
    this.itemsSubject.next(this.itemsSubject.value.filter(i => i.id !== id));
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
