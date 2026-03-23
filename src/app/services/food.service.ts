import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FoodItem, FoodCategory } from '../models/food-item.model';
import { EventService } from './event.service';
import { generateClient } from 'aws-amplify/api';

const client = generateClient();

const FOOD_FIELDS = `id eventId category item notes servings broughtBy`;

@Injectable({ providedIn: 'root' })
export class FoodService {
  private itemsSubject = new BehaviorSubject<FoodItem[]>([]);
  items$: Observable<FoodItem[]> = this.itemsSubject.asObservable();

  constructor(private eventService: EventService) {
    this.loadItems();
  }

  private async loadItems(): Promise<void> {
    await this.eventService.loadOrCreateEvent();
    const eventId = this.eventService.currentEvent.id;
    try {
      const result: any = await client.graphql({
        query: `query ListFoodItems($eventId: ID!) {
          listFoodItems(filter: { eventId: { eq: $eventId } }) { items { ${FOOD_FIELDS} } }
        }`,
        variables: { eventId }
      });
      this.itemsSubject.next(result.data.listFoodItems.items);
    } catch (e) {
      console.warn('Could not load food items from API.', e);
    }
  }

  async addItem(category: FoodCategory, item: string, broughtBy: string, servings?: number, notes?: string): Promise<void> {
    const eventId = this.eventService.currentEvent.id;
    const input = {
      eventId,
      category,
      item: item.trim(),
      broughtBy: broughtBy.trim(),
      servings: servings ?? null,
      notes: notes?.trim() || null,
    };
    try {
      const result: any = await client.graphql({
        query: `mutation CreateFoodItem($input: CreateFoodItemInput!) {
          createFoodItem(input: $input) { ${FOOD_FIELDS} }
        }`,
        variables: { input }
      });
      this.itemsSubject.next([...this.itemsSubject.value, result.data.createFoodItem]);
    } catch (e) {
      console.error('Could not add food item.', e);
    }
  }

  async removeItem(id: string): Promise<void> {
    try {
      await client.graphql({
        query: `mutation DeleteFoodItem($input: DeleteFoodItemInput!) {
          deleteFoodItem(input: $input) { id }
        }`,
        variables: { input: { id } }
      });
      this.itemsSubject.next(this.itemsSubject.value.filter(i => i.id !== id));
    } catch (e) {
      console.error('Could not remove food item.', e);
    }
  }
}
