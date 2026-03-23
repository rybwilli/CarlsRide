import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { generateClient } from 'aws-amplify/api';

export interface AppEvent {
  id: string;
  name: string;
  date: string;
  gatheringTime: string;
  location: string;
  description?: string;
}

const FALLBACK_EVENT: AppEvent = {
  id: 'carls-ride-2026',
  name: "Carl's Ride in a month",
  date: '2026-05-09',
  gatheringTime: '2:00 PM',
  location: '4209 Branson St.',
  description: 'A memorial ride for Carl.',
};

const EVENT_FIELDS = `id name date gatheringTime location description`;
const ACTIVE_EVENT_KEY = 'carlsride_active_event_id';
const ADMIN_TOKEN = 'carlsride-admin';

const client = generateClient();

@Injectable({ providedIn: 'root' })
export class EventService {
  private activeEventSubject = new BehaviorSubject<AppEvent>(FALLBACK_EVENT);
  private allEventsSubject = new BehaviorSubject<AppEvent[]>([]);

  event$: Observable<AppEvent> = this.activeEventSubject.asObservable();
  allEvents$: Observable<AppEvent[]> = this.allEventsSubject.asObservable();

  readonly adminToken = ADMIN_TOKEN;

  get currentEvent(): AppEvent {
    return this.activeEventSubject.value;
  }

  async loadOrCreateEvent(): Promise<void> {
    try {
      const result: any = await client.graphql({
        query: `query ListEvents { listEvents { items { ${EVENT_FIELDS} } } }`
      });
      const items: AppEvent[] = result.data.listEvents.items;
      this.allEventsSubject.next(items);

      if (items.length === 0) {
        await this.createEvent(FALLBACK_EVENT);
        return;
      }

      const savedId = localStorage.getItem(ACTIVE_EVENT_KEY);
      const active = items.find(e => e.id === savedId) ?? items[0];
      this.activeEventSubject.next(active);
    } catch (e) {
      console.warn('Could not load event from API, using default.', e);
    }
  }

  setActiveEvent(event: AppEvent): void {
    localStorage.setItem(ACTIVE_EVENT_KEY, event.id);
    this.activeEventSubject.next(event);
  }

  async createEvent(input: Omit<AppEvent, 'id'>): Promise<AppEvent | undefined> {
    try {
      const result: any = await client.graphql({
        query: `mutation CreateEvent($input: CreateEventInput!) {
          createEvent(input: $input) { ${EVENT_FIELDS} }
        }`,
        variables: { input }
      });
      const created: AppEvent = result.data.createEvent;
      this.allEventsSubject.next([...this.allEventsSubject.value, created]);
      this.activeEventSubject.next(created);
      localStorage.setItem(ACTIVE_EVENT_KEY, created.id);
      return created;
    } catch (e) {
      console.warn('Could not create event.', e);
      return undefined;
    }
  }

  async updateEvent(id: string, changes: Partial<Omit<AppEvent, 'id'>>): Promise<void> {
    try {
      const result: any = await client.graphql({
        query: `mutation UpdateEvent($input: UpdateEventInput!) {
          updateEvent(input: $input) { ${EVENT_FIELDS} }
        }`,
        variables: { input: { id, ...changes } }
      });
      const updated: AppEvent = result.data.updateEvent;
      this.allEventsSubject.next(this.allEventsSubject.value.map(e => e.id === id ? updated : e));
      if (this.activeEventSubject.value.id === id) {
        this.activeEventSubject.next(updated);
      }
    } catch (e) {
      console.warn('Could not update event.', e);
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      await client.graphql({
        query: `mutation DeleteEvent($input: DeleteEventInput!) {
          deleteEvent(input: $input) { id }
        }`,
        variables: { input: { id } }
      });
      const remaining = this.allEventsSubject.value.filter(e => e.id !== id);
      this.allEventsSubject.next(remaining);
      if (this.activeEventSubject.value.id === id) {
        const next = remaining[0] ?? FALLBACK_EVENT;
        this.activeEventSubject.next(next);
        localStorage.setItem(ACTIVE_EVENT_KEY, next.id);
      }
    } catch (e) {
      console.warn('Could not delete event.', e);
    }
  }
}
