import { Component } from '@angular/core';
import { Observable, map } from 'rxjs';
import { FoodCategory, FoodItem } from '../../models/food-item.model';
import { FoodService } from '../../services/food.service';

interface CategorySection {
  category: FoodCategory;
  label: string;
  emoji: string;
  items: FoodItem[];
}

@Component({
  selector: 'app-food-signup',
  templateUrl: './food-signup.component.html',
  styleUrls: ['./food-signup.component.scss'],
})
export class FoodSignupComponent {
  sections$: Observable<CategorySection[]>;

  addCategory: FoodCategory = 'bbq';
  addItem = '';
  addName = '';
  addServings: number | null = null;

  readonly categories: { value: FoodCategory; label: string; emoji: string }[] = [
    { value: 'bbq',      label: 'BBQ',                  emoji: '🔥' },
    { value: 'sides',    label: 'Sides',                emoji: '🥗' },
    { value: 'drinks',   label: 'Alcoholic Drinks',      emoji: '🍺' },
    { value: 'na-drinks', label: 'Non-Alcoholic Drinks', emoji: '🥤' },
  ];

  constructor(private foodService: FoodService) {
    this.sections$ = foodService.items$.pipe(
      map(items =>
        this.categories.map(c => ({
          category: c.value,
          label: c.label,
          emoji: c.emoji,
          items: items.filter(i => i.category === c.value),
        }))
      )
    );
  }

  get servingsPlaceholder(): string {
    return this.addCategory === 'bbq' ? '12–24' : '6–12';
  }

  get isValid(): boolean {
    return !!(this.addItem.trim() && this.addName.trim());
  }

  submit(): void {
    if (!this.isValid) return;
    this.foodService.addItem(
      this.addCategory,
      this.addItem,
      this.addName,
      this.addServings ?? undefined
    );
    this.addItem = '';
    this.addName = '';
    this.addServings = null;
  }

  remove(id: string): void {
    this.foodService.removeItem(id);
  }
}
