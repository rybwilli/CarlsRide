import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Ride, Rider } from '../models/ride.model';
import { EventService } from './event.service';
import { generateClient } from 'aws-amplify/api';

const client = generateClient();

const RIDE_FIELDS = `
  id eventId name startLocation departureTime distanceMiles
  difficulty bikeType description leader leaderContact notes
  routeLinks { linkType url }
  riders { name email additionalGuests }
`;

@Injectable({ providedIn: 'root' })
export class RideService {
  get bbqLocation(): string { return this.eventService.currentEvent.location; }

  private ridesSubject = new BehaviorSubject<Ride[]>([]);
  rides$: Observable<Ride[]> = this.ridesSubject.asObservable();

  constructor(private eventService: EventService) {
    this.loadRides();
  }

  private async loadRides(): Promise<void> {
    await this.eventService.loadOrCreateEvent();
    const eventId = this.eventService.currentEvent.id;
    try {
      const result: any = await client.graphql({
        query: `query ListRides($eventId: ID!) {
          listRides(filter: { eventId: { eq: $eventId } }) { items { ${RIDE_FIELDS} } }
        }`,
        variables: { eventId }
      });
      const items = result.data.listRides.items.map(this.mapRide);
      this.ridesSubject.next(items);
    } catch (e) {
      console.warn('Could not load rides from API.', e);
    }
  }

  private mapRide(r: any): Ride {
    return {
      ...r,
      routeLinks: r.routeLinks?.map((l: any) => ({ type: l.linkType, url: l.url })) ?? [],
      riders: r.riders ?? [],
    };
  }

  getRide(id: string): Ride | undefined {
    return this.ridesSubject.value.find(r => r.id === id);
  }

  async addRide(ride: Omit<Ride, 'id' | 'riders'>): Promise<Ride> {
    const eventId = this.eventService.currentEvent.id;
    const input = {
      eventId,
      name: ride.name,
      startLocation: ride.startLocation,
      departureTime: ride.departureTime,
      distanceMiles: ride.distanceMiles,
      difficulty: ride.difficulty,
      bikeType: ride.bikeType,
      description: ride.description,
      leader: ride.leader,
      leaderContact: ride.leaderContact,
      notes: ride.notes,
      routeLinks: ride.routeLinks?.map(l => ({ linkType: l.type, url: l.url })),
      riders: [{ name: ride.leader, email: ride.leaderContact }],
    };
    const result: any = await client.graphql({
      query: `mutation CreateRide($input: CreateRideInput!) {
        createRide(input: $input) { ${RIDE_FIELDS} }
      }`,
      variables: { input }
    });
    const newRide = this.mapRide(result.data.createRide);
    this.ridesSubject.next([...this.ridesSubject.value, newRide]);
    return newRide;
  }

  async updateRide(id: string, updates: Omit<Ride, 'id' | 'riders'>): Promise<void> {
    const existing = this.getRide(id);
    const input = {
      id,
      name: updates.name,
      startLocation: updates.startLocation,
      departureTime: updates.departureTime,
      distanceMiles: updates.distanceMiles,
      difficulty: updates.difficulty,
      bikeType: updates.bikeType,
      description: updates.description,
      leader: updates.leader,
      leaderContact: updates.leaderContact,
      notes: updates.notes,
      routeLinks: updates.routeLinks?.map(l => ({ linkType: l.type, url: l.url })),
      riders: existing?.riders?.map(r => ({ name: r.name, email: r.email, additionalGuests: r.additionalGuests })),
    };
    await client.graphql({
      query: `mutation UpdateRide($input: UpdateRideInput!) {
        updateRide(input: $input) { ${RIDE_FIELDS} }
      }`,
      variables: { input }
    });
    const rides = this.ridesSubject.value.map(r => r.id === id ? { ...r, ...updates } : r);
    this.ridesSubject.next(rides);
  }

  async joinRide(rideId: string, rider: Rider): Promise<void> {
    const ride = this.getRide(rideId);
    if (!ride) return;
    const alreadyJoined = ride.riders.some(r => r.name.toLowerCase() === rider.name.toLowerCase());
    if (alreadyJoined) return;
    const updatedRiders = [...ride.riders, rider];
    await client.graphql({
      query: `mutation UpdateRide($input: UpdateRideInput!) {
        updateRide(input: $input) { id }
      }`,
      variables: { input: { id: rideId, riders: updatedRiders.map(r => ({ name: r.name, email: r.email, additionalGuests: r.additionalGuests })) } }
    });
    const rides = this.ridesSubject.value.map(r => r.id === rideId ? { ...r, riders: updatedRiders } : r);
    this.ridesSubject.next(rides);
  }

  async removeRider(rideId: string, riderName: string): Promise<void> {
    const ride = this.getRide(rideId);
    if (!ride) return;
    const updatedRiders = ride.riders.filter(r => r.name !== riderName);
    await client.graphql({
      query: `mutation UpdateRide($input: UpdateRideInput!) {
        updateRide(input: $input) { id }
      }`,
      variables: { input: { id: rideId, riders: updatedRiders.map(r => ({ name: r.name, email: r.email, additionalGuests: r.additionalGuests })) } }
    });
    const rides = this.ridesSubject.value.map(r => r.id === rideId ? { ...r, riders: updatedRiders } : r);
    this.ridesSubject.next(rides);
  }
}
