import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FoodItem, FoodCategory } from '../models/food-item.model';

const MOCK_ITEMS: FoodItem[] = [
  { id: '1', category: 'bbq',    item: 'Burgers',       broughtBy: 'Carl',  servings: 20 },
  { id: '2', category: 'bbq',    item: 'Hot dogs',      broughtBy: 'Maria', servings: 24 },
  { id: '3', category: 'sides',  item: 'Potato salad',  broughtBy: 'Dana',  servings: 10 },
  { id: '4', category: 'drinks', item: 'Lemonade',      broughtBy: 'Jake',  servings: 12 },
];

@Injectable({ providedIn: 'root' })
export class FoodService {
  private itemsSubject = new BehaviorSubject<FoodItem[]>(MOCK_ITEMS);
  items$: Observable<FoodItem[]> = this.itemsSubject.asObservable();

  addItem(category: FoodCategory, item: string, broughtBy: string, servings?: number, notes?: string): void {
    const newItem: FoodItem = {
      id: Date.now().toString(),
      category,
      item: item.trim(),
      broughtBy: broughtBy.trim(),
      servings: servings ?? undefined,
      notes: notes?.trim() || undefined,
    };
    this.itemsSubject.next([...this.itemsSubject.value, newItem]);
  }

  removeItem(id: string): void {
    this.itemsSubject.next(this.itemsSubject.value.filter(i => i.id !== id));
  }
}
