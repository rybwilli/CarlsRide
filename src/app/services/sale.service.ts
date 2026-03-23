import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SaleItem, SaleCategory } from '../models/sale-item.model';

const MOCK_ITEMS: SaleItem[] = [
  {
    id: '1',
    name: 'Trek Domane SL 5',
    description: '2021 road bike, 56cm, lightly used. Great condition, new bar tape.',
    price: 2200,
    category: 'bikes',
    status: 'available',
    seller: 'Ryan',
  },
  {
    id: '2',
    name: 'Shimano 105 Groupset',
    description: 'R7000 series, 11-speed. Removed from above bike upgrade.',
    price: 350,
    category: 'parts',
    status: 'available',
    seller: 'Ryan',
  },
  {
    id: '3',
    name: 'Pearl Izumi Bib Shorts',
    description: 'Size medium, black. Worn a handful of times.',
    price: 45,
    category: 'clothing',
    status: 'pending',
    seller: 'Sarah',
  },
];

@Injectable({ providedIn: 'root' })
export class SaleService {
  private itemsSubject = new BehaviorSubject<SaleItem[]>(MOCK_ITEMS);
  items$: Observable<SaleItem[]> = this.itemsSubject.asObservable();

  readonly venmoUsername = 'Ryan-Williams-09432';
  readonly sellerToken = 'carlsride2026';

  readonly categories: { value: SaleCategory; label: string; emoji: string }[] = [
    { value: 'bikes',       label: 'Bikes',       emoji: '🚲' },
    { value: 'parts',       label: 'Parts',       emoji: '🔧' },
    { value: 'wheels',      label: 'Wheels',      emoji: '⭕' },
    { value: 'tires',       label: 'Tires',       emoji: '🏎️' },
    { value: 'tools',       label: 'Tools',       emoji: '🛠️' },
    { value: 'clothing',    label: 'Clothing',    emoji: '👕' },
    { value: 'accessories', label: 'Accessories', emoji: '🎒' },
    { value: 'other',       label: 'Other',       emoji: '📦' },
  ];

  addItem(item: Omit<SaleItem, 'id' | 'status'>): SaleItem {
    const newItem: SaleItem = { ...item, id: Date.now().toString(), status: 'available' };
    this.itemsSubject.next([...this.itemsSubject.value, newItem]);
    return newItem;
  }

  markPending(id: string): void {
    this.itemsSubject.next(
      this.itemsSubject.value.map(i => i.id === id ? { ...i, status: 'pending' } : i)
    );
  }

  markSold(id: string): void {
    this.itemsSubject.next(
      this.itemsSubject.value.map(i => i.id === id ? { ...i, status: 'sold' } : i)
    );
  }

  getItem(id: string): SaleItem | undefined {
    return this.itemsSubject.value.find(i => i.id === id);
  }

  updateItem(id: string, changes: Partial<Omit<SaleItem, 'id'>>): void {
    this.itemsSubject.next(
      this.itemsSubject.value.map(i => i.id === id ? { ...i, ...changes } : i)
    );
  }

  markAvailable(id: string): void {
    this.itemsSubject.next(
      this.itemsSubject.value.map(i => i.id === id ? { ...i, status: 'available' } : i)
    );
  }

  getVenmoUrl(item: SaleItem): string {
    return `https://venmo.com/${this.venmoUsername}?txn=pay&amount=${item.price}&note=${encodeURIComponent(item.name)}`;
  }
}
