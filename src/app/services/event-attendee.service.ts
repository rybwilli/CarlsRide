import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { generateClient } from 'aws-amplify/api';

export interface EventAttendee {
  id: string;
  eventId: string;
  name: string;
  additionalPeople: number;
  email?: string;
  contact?: string;
}

const ATTENDEE_FIELDS = `id eventId name additionalPeople email contact`;

const client = generateClient();

@Injectable({ providedIn: 'root' })
export class EventAttendeeService {
  private attendeesSubject = new BehaviorSubject<EventAttendee[]>([]);

  attendees$: Observable<EventAttendee[]> = this.attendeesSubject.asObservable();

  async loadAttendees(eventId: string): Promise<void> {
    try {
      const result: any = await client.graphql({
        query: `query ListEventAttendees($filter: ModelEventAttendeeFilterInput) {
          listEventAttendees(filter: $filter) { items { ${ATTENDEE_FIELDS} } }
        }`,
        variables: { filter: { eventId: { eq: eventId } } }
      });
      this.attendeesSubject.next(result.data.listEventAttendees.items);
    } catch (e) {
      console.warn('Could not load attendees.', e);
    }
  }

  async createAttendee(input: Omit<EventAttendee, 'id'>): Promise<EventAttendee | undefined> {
    try {
      const result: any = await client.graphql({
        query: `mutation CreateEventAttendee($input: CreateEventAttendeeInput!) {
          createEventAttendee(input: $input) { ${ATTENDEE_FIELDS} }
        }`,
        variables: { input }
      });
      const created: EventAttendee = result.data.createEventAttendee;
      this.attendeesSubject.next([...this.attendeesSubject.value, created]);
      return created;
    } catch (e) {
      console.warn('Could not create attendee.', e);
      return undefined;
    }
  }

  async updateAttendee(id: string, changes: Partial<Omit<EventAttendee, 'id' | 'eventId'>>): Promise<void> {
    try {
      const result: any = await client.graphql({
        query: `mutation UpdateEventAttendee($input: UpdateEventAttendeeInput!) {
          updateEventAttendee(input: $input) { ${ATTENDEE_FIELDS} }
        }`,
        variables: { input: { id, ...changes } }
      });
      const updated: EventAttendee = result.data.updateEventAttendee;
      this.attendeesSubject.next(this.attendeesSubject.value.map(a => a.id === id ? updated : a));
    } catch (e) {
      console.warn('Could not update attendee.', e);
    }
  }

  async deleteAttendee(id: string): Promise<void> {
    try {
      await client.graphql({
        query: `mutation DeleteEventAttendee($input: DeleteEventAttendeeInput!) {
          deleteEventAttendee(input: $input) { id }
        }`,
        variables: { input: { id } }
      });
      this.attendeesSubject.next(this.attendeesSubject.value.filter(a => a.id !== id));
    } catch (e) {
      console.warn('Could not delete attendee.', e);
    }
  }
}
