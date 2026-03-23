import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Wraps AWS Amplify GraphQL calls.
 * Import and inject this service instead of calling Amplify directly.
 * Until amplify push is run, the mock services remain active.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {

  // ── Events ────────────────────────────────────────────────────────────────

  listEvents(): Observable<any[]> {
    return from(this.query(`
      query ListEvents {
        listEvents { items { id name date gatheringTime location description } }
      }
    `)).pipe(map((r: any) => r.data.listEvents.items));
  }

  getEvent(id: string): Observable<any> {
    return from(this.query(`
      query GetEvent($id: ID!) {
        getEvent(id: $id) { id name date gatheringTime location description }
      }
    `, { id })).pipe(map((r: any) => r.data.getEvent));
  }

  createEvent(input: any): Observable<any> {
    return from(this.mutate(`
      mutation CreateEvent($input: CreateEventInput!) {
        createEvent(input: $input) { id name date gatheringTime location description }
      }
    `, { input })).pipe(map((r: any) => r.data.createEvent));
  }

  // ── Rides ─────────────────────────────────────────────────────────────────

  listRidesByEvent(eventId: string): Observable<any[]> {
    return from(this.query(`
      query ListRidesByEvent($eventId: ID!) {
        listRides(filter: { eventId: { eq: $eventId } }) {
          items {
            id eventId name startLocation departureTime distanceMiles
            difficulty bikeType description leader leaderContact notes
            routeLinks { type url }
            riders { name email additionalGuests }
          }
        }
      }
    `, { eventId })).pipe(map((r: any) => r.data.listRides.items));
  }

  createRide(input: any): Observable<any> {
    return from(this.mutate(`
      mutation CreateRide($input: CreateRideInput!) {
        createRide(input: $input) { id name }
      }
    `, { input })).pipe(map((r: any) => r.data.createRide));
  }

  updateRide(input: any): Observable<any> {
    return from(this.mutate(`
      mutation UpdateRide($input: UpdateRideInput!) {
        updateRide(input: $input) { id name }
      }
    `, { input })).pipe(map((r: any) => r.data.updateRide));
  }

  // ── Food Items ────────────────────────────────────────────────────────────

  listFoodByEvent(eventId: string): Observable<any[]> {
    return from(this.query(`
      query ListFoodByEvent($eventId: ID!) {
        listFoodItems(filter: { eventId: { eq: $eventId } }) {
          items { id eventId category item notes servings broughtBy }
        }
      }
    `, { eventId })).pipe(map((r: any) => r.data.listFoodItems.items));
  }

  createFoodItem(input: any): Observable<any> {
    return from(this.mutate(`
      mutation CreateFoodItem($input: CreateFoodItemInput!) {
        createFoodItem(input: $input) { id item broughtBy }
      }
    `, { input })).pipe(map((r: any) => r.data.createFoodItem));
  }

  deleteFoodItem(id: string): Observable<any> {
    return from(this.mutate(`
      mutation DeleteFoodItem($input: DeleteFoodItemInput!) {
        deleteFoodItem(input: $input) { id }
      }
    `, { input: { id } })).pipe(map((r: any) => r.data.deleteFoodItem));
  }

  // ── Sale Items ────────────────────────────────────────────────────────────

  listSaleItems(): Observable<any[]> {
    return from(this.query(`
      query ListSaleItems {
        listSaleItems { items { id name description price category status seller images } }
      }
    `)).pipe(map((r: any) => r.data.listSaleItems.items));
  }

  createSaleItem(input: any): Observable<any> {
    return from(this.mutate(`
      mutation CreateSaleItem($input: CreateSaleItemInput!) {
        createSaleItem(input: $input) { id name }
      }
    `, { input })).pipe(map((r: any) => r.data.createSaleItem));
  }

  updateSaleItem(input: any): Observable<any> {
    return from(this.mutate(`
      mutation UpdateSaleItem($input: UpdateSaleItemInput!) {
        updateSaleItem(input: $input) { id status }
      }
    `, { input })).pipe(map((r: any) => r.data.updateSaleItem));
  }

  // ── Internals ─────────────────────────────────────────────────────────────

  private async query(query: string, variables?: any): Promise<any> {
    const { API } = await import('aws-amplify');
    return API.graphql({ query, variables });
  }

  private async mutate(mutation: string, variables?: any): Promise<any> {
    const { API } = await import('aws-amplify');
    return API.graphql({ query: mutation, variables });
  }
}
