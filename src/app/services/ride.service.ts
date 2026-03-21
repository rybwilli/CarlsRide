import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Ride, Rider } from '../models/ride.model';

const BBQ_LOCATION = 'Riverside Park Pavilion';

const MOCK_RIDES: Ride[] = [
  {
    id: '1',
    name: 'River Trail Route',
    startLocation: 'Downtown Library Parking Lot',
    departureTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    distanceMiles: 12,
    difficulty: 'easy',
    leader: 'Carl',
    leaderContact: 'carl@example.com',
    notes: 'Flat, paved trail the whole way. Great for all skill levels.',
    riders: [{ name: 'Carl', email: 'carl@example.com' }],
  },
  {
    id: '2',
    name: 'Hillside Challenge',
    startLocation: 'North Park Trailhead',
    departureTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    distanceMiles: 22,
    difficulty: 'hard',
    leader: 'Maria',
    leaderContact: 'maria@example.com',
    notes: 'Bring plenty of water. Significant elevation gain.',
    riders: [{ name: 'Maria', email: 'maria@example.com' }, { name: 'Jake' }],
  },
  {
    id: '3',
    name: 'Suburbs Loop',
    startLocation: 'Westside Community Center',
    departureTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    distanceMiles: 16,
    difficulty: 'moderate',
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
      riders: [],
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
}
