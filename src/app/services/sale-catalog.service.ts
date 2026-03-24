import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Sale } from '../models/sale.model';
import { generateClient } from 'aws-amplify/api';

const client = generateClient();

const SALE_FIELDS = `id name description isActive`;

const FALLBACK_SALE: Sale = {
  id: 'carls-ride-2026-sale',
  name: "Carl's Ride 2026",
  description: "The Gear Sale to clear out Carl's collection of bike stuff",
  isActive: true,
};

@Injectable({ providedIn: 'root' })
export class SaleCatalogService {
  private allSalesSubject = new BehaviorSubject<Sale[]>([]);
  private activeSaleSubject = new BehaviorSubject<Sale>(FALLBACK_SALE);

  allSales$: Observable<Sale[]> = this.allSalesSubject.asObservable();
  activeSale$: Observable<Sale> = this.activeSaleSubject.asObservable();

  get activeSale(): Sale {
    return this.activeSaleSubject.value;
  }

  async loadOrCreateSale(): Promise<void> {
    try {
      const result: any = await client.graphql({
        query: `query ListSales { listSales { items { ${SALE_FIELDS} } } }`
      });
      const items: Sale[] = result.data.listSales.items;
      this.allSalesSubject.next(items);

      if (items.length === 0) {
        await this.createSale(FALLBACK_SALE);
        return;
      }

      const active = items.find(s => s.isActive) ?? items[0];
      this.activeSaleSubject.next(active);
    } catch (e) {
      console.warn('Could not load sales from API, using default.', e);
    }
  }

  async createSale(input: Omit<Sale, 'id'> & { id?: string }): Promise<Sale | undefined> {
    try {
      const result: any = await client.graphql({
        query: `mutation CreateSale($input: CreateSaleInput!) {
          createSale(input: $input) { ${SALE_FIELDS} }
        }`,
        variables: { input }
      });
      const created: Sale = result.data.createSale;
      this.allSalesSubject.next([...this.allSalesSubject.value, created]);
      if (created.isActive) this.activeSaleSubject.next(created);
      return created;
    } catch (e) {
      console.warn('Could not create sale.', e);
      return undefined;
    }
  }

  async updateSale(id: string, changes: Partial<Omit<Sale, 'id'>>): Promise<void> {
    try {
      const result: any = await client.graphql({
        query: `mutation UpdateSale($input: UpdateSaleInput!) {
          updateSale(input: $input) { ${SALE_FIELDS} }
        }`,
        variables: { input: { id, ...changes } }
      });
      const updated: Sale = result.data.updateSale;
      this.allSalesSubject.next(this.allSalesSubject.value.map(s => s.id === id ? updated : s));
      if (this.activeSaleSubject.value.id === id) this.activeSaleSubject.next(updated);
    } catch (e) {
      console.warn('Could not update sale.', e);
    }
  }

  async setActiveSale(sale: Sale): Promise<void> {
    // Deactivate current active
    const current = this.allSalesSubject.value.find(s => s.isActive && s.id !== sale.id);
    if (current) await this.updateSale(current.id, { isActive: false });
    await this.updateSale(sale.id, { isActive: true });
    this.activeSaleSubject.next({ ...sale, isActive: true });
  }

  async deleteSale(id: string): Promise<void> {
    try {
      await client.graphql({
        query: `mutation DeleteSale($input: DeleteSaleInput!) {
          deleteSale(input: $input) { id }
        }`,
        variables: { input: { id } }
      });
      const remaining = this.allSalesSubject.value.filter(s => s.id !== id);
      this.allSalesSubject.next(remaining);
      if (this.activeSaleSubject.value.id === id) {
        const next = remaining.find(s => s.isActive) ?? remaining[0] ?? FALLBACK_SALE;
        this.activeSaleSubject.next(next);
      }
    } catch (e) {
      console.warn('Could not delete sale.', e);
    }
  }
}
