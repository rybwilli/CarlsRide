import { Component } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { FoodCategory, FoodItem } from '../../models/food-item.model';
import { FoodService } from '../../services/food.service';
import { RideService } from '../../services/ride.service';

interface CategorySection {
  category: FoodCategory;
  label: string;
  emoji: string;
  items: FoodItem[];
  totalServings: number;
  minMultiplier: number;
  maxMultiplier: number;
}

interface FoodPageData {
  sections: CategorySection[];
  attendees: number;
}

@Component({
  selector: 'app-food-signup',
  templateUrl: './food-signup.component.html',
  styleUrls: ['./food-signup.component.scss'],
})
export class FoodSignupComponent {
  data$: Observable<FoodPageData>;

  addCategory: FoodCategory = 'bbq';
  addItem = '';
  addName = '';
  addServings: number | null = null;
  addNotes = '';

  readonly categories: { value: FoodCategory; label: string; emoji: string }[] = [
    { value: 'bbq',       label: 'BBQ and Mains',         emoji: '🔥' },
    { value: 'sides',     label: 'Sides',                emoji: '🥗' },
    { value: 'drinks',    label: 'Alcoholic Drinks',      emoji: '🍺' },
    { value: 'na-drinks', label: 'Non-Alcoholic Drinks',  emoji: '🥤' },
  ];

  constructor(private foodService: FoodService, rideService: RideService) {
    this.data$ = combineLatest([foodService.items$, rideService.rides$]).pipe(
      map(([items, rides]) => {
        const attendees = rides.flatMap(r => r.riders)
          .reduce((sum, r) => sum + 1 + (r.additionalGuests ?? 0), 0);

        const sections = this.categories.map(c => ({
          category: c.value,
          label: c.label,
          emoji: c.emoji,
          items: items.filter(i => i.category === c.value),
          totalServings: items
            .filter(i => i.category === c.value)
            .reduce((sum, i) => sum + (i.servings ?? 0), 0),
          minMultiplier: c.value === 'bbq' ? 5 : 3,
          maxMultiplier: c.value === 'bbq' ? 6 : 4,
        }));

        return { sections, attendees };
      })
    );
  }

  get servingsPlaceholder(): string {
    return this.addCategory === 'bbq' ? '12–24' : '6–12';
  }

  get isValid(): boolean {
    return !!(this.addItem.trim() && this.addName.trim());
  }

  async submit(): Promise<void> {
    if (!this.isValid) return;
    await this.foodService.addItem(
      this.addCategory,
      this.addItem,
      this.addName,
      this.addServings ?? undefined,
      this.addNotes || undefined
    );
    this.addItem = '';
    this.addName = '';
    this.addServings = null;
    this.addNotes = '';
  }

  remove(id: string): void {
    this.foodService.removeItem(id);
  }
}
