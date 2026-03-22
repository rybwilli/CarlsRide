import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FoodItem, FoodCategory } from '../models/food-item.model';

const MOCK_ITEMS: FoodItem[] = [
  { id: '1', category: 'bbq',    item: 'Pulled Pork', notes: "Green Chile Aioli", broughtBy: 'Ryan W',  servings: 30 },
  { id: '2', category: 'bbq',    item: 'Memphis Ribs',      broughtBy: 'Chris W', servings: 24 },
  { id: '3', category: 'bbq',    item: 'BBQ Ribs',      broughtBy: 'Ehren', servings: 24 },
  { id: '12', category: 'bbq',    item: 'Burnt Ends',      broughtBy: 'Phil', servings: 24 },
  { id: '4', category: 'sides',  item: 'Potato Salad',  broughtBy: 'Dana',  servings: 12 },
  { id: '5', category: 'sides',  item: 'Chips', notes: 'Tortilla',  broughtBy: 'Oman',  servings: 10 },
  { id: '6', category: 'sides',  item: 'Buns', notes: 'full burger buns',  broughtBy: 'Dana',  servings: 12 },
  { id: '7', category: 'drinks', item: 'IPA',notes: "Furious", broughtBy: 'Jake',  servings: 12 },
  { id: '8', category: 'drinks', item: 'Coors Light',notes: "Yup, you know it", broughtBy: 'Mark H',  servings: 12 },
  { id: '9', category: 'na-drinks', item: 'Water', broughtBy: 'Dana',  servings: 18 },
  { id: '10', category: 'na-drinks', item: 'Soda', notes: "Coke & Dr. Pepper", broughtBy: 'Orvil',  servings: 18 },
  { id: '11', category: 'na-drinks', item: 'Sparkling Water', notes: "Bbbly", broughtBy: 'Luka',  servings: 12 },
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
