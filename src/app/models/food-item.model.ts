export type FoodCategory = 'bbq' | 'sides' | 'drinks' | 'na-drinks';

export interface FoodItem {
  id: string;
  category: FoodCategory;
  item: string;
  broughtBy: string;
  servings?: number;
  notes?: string;
}
