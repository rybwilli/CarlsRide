import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Ride, Rider } from '../models/ride.model';

const BBQ_LOCATION = '4209 Branson St.';

const MOCK_RIDES: Ride[] = [
  {
    id: '1',
    name: 'River Trail Route',
    startLocation: 'Downtown Library Parking Lot',
    departureTime: '10:00',
    distanceMiles: 12,
    difficulty: 'easy',
    bikeType: 'city',
    description: 'A relaxed ride along the river trail.',
    leader: 'Reid',
    leaderContact: 'carl@example.com',
    notes: 'Flat, paved trail the whole way. Great for all skill levels.',
    riders: [{ name: 'Reid', email: 'rieddo@example.com' }],
  },
  {
    id: '2',
    name: 'Hillside Challenge',
    startLocation: 'North Park Trailhead',
    departureTime: '09:00',
    distanceMiles: 22,
    difficulty: 'hard',
    bikeType: 'mountain',
    description: 'A tough climb with rewarding views.',
    leader: 'Maria',
    leaderContact: 'maria@example.com',
    notes: 'Bring plenty of water. Significant elevation gain.',
    riders: [{ name: 'Maria', email: 'maria@example.com' }, { name: 'Jake' }],
  },
  {
    id: '3',
    name: 'Suburbs Loop',
    startLocation: 'Westside Community Center',
    departureTime: '10:30',
    distanceMiles: 16,
    difficulty: 'moderate',
    bikeType: 'gravel',
    description: 'A scenic loop through the neighborhoods.',
    leader: 'Sam',
    riders: [{ name: 'Sam' }, { name: 'Dana' }, { name: 'Alex' }],
  },
];

@Injectable({ providedIn: 'root' })
export class RideService {
  readonly bbqLocation = BBQ_LOCATION;

  private ridesSubject = new BehaviorSubject<Ride[]>(MOCK_RIDES);
  rides$: Observable<Ride[]> = this.ridesSubject.asObservable();

  getRide(id: string): Ride | undefined {
    return this.ridesSubject.value.find(r => r.id === id);
  }

  addRide(ride: Omit<Ride, 'id' | 'riders'>): Ride {
    const newRide: Ride = {
      ...ride,
      id: Date.now().toString(),
      riders: [{ name: ride.leader, email: ride.leaderContact }],
    };
    this.ridesSubject.next([...this.ridesSubject.value, newRide]);
    return newRide;
  }

  joinRide(rideId: string, rider: Rider): void {
    const rides = this.ridesSubject.value.map(r => {
      if (r.id !== rideId) return r;
      const alreadyJoined = r.riders.some(
        existing => existing.name.toLowerCase() === rider.name.toLowerCase()
      );
      if (alreadyJoined) return r;
      return { ...r, riders: [...r.riders, rider] };
    });
    this.ridesSubject.next(rides);
  }

  removeRider(rideId: string, riderName: string): void {
    const rides = this.ridesSubject.value.map(r => {
      if (r.id !== rideId) return r;
      return { ...r, riders: r.riders.filter(rider => rider.name !== riderName) };
    });
    this.ridesSubject.next(rides);
  }

  updateRide(id: string, updates: Omit<Ride, 'id' | 'riders'>): void {
    const rides = this.ridesSubject.value.map(r =>
      r.id === id ? { ...r, ...updates } : r
    );
    this.ridesSubject.next(rides);
  }
}
