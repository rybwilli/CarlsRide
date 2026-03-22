import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Ride, Rider } from '../models/ride.model';

const BBQ_LOCATION = '4209 Branson St.';

const MOCK_RIDES: Ride[] = [
  {
    id: '1',
    name: 'Super Looper Duper',
    startLocation: 'Morningside & Grimes',
    departureTime: '09:30',
    distanceMiles: 74,
    difficulty: 'hard',
    bikeType: 'road',
    description: 'A long, fast road ride into the west metro. One stop to refeul and back for the party',
    leader: 'Chris W',
    leaderContact: 'chris@example.com',
    routeLinks: [{
      type: 'strava',
      url: 'https://www.strava.com/routes/3381285318547588554'
    }],
    notes: '19-20 mph average',
    riders: [{ name: 'Chris W', email: 'chris@example.com' }, {name: 'Ryan W', email: 'rybwilli@gmail.com', additionalGuests: 2}, {name: 'Brandon T', email: 'trigger@example.com'}],
  },
  {
    id: '2',
    name: 'City Scape',
    startLocation: 'Scott Terrace & Morningside',
    departureTime: '12:00',
    distanceMiles: 16,
    difficulty: 'moderately easy',
    bikeType: 'city',
    description: 'Out and back on regional trails for Lake Monster and Sisyphus',
    leader: 'Jason',
    leaderContact: 'jason@example.com',
    notes: 'Brind ID and a lock.',
    riders: [{ name: 'Jason', email: 'jason@example.com', additionalGuests: 2 }, { name: 'Zohran' }, { name: 'Arnold' }],
  },
  {
    id: '3',
    name: 'Theo MTN Bike Loop',
    startLocation: 'Morningside & Grimes',
    departureTime: '11:30',
    distanceMiles: 29,
    difficulty: 'moderately hard',
    bikeType: 'mountain',
    description: 'Stroll up to Theo trails and make a round adn come home for some BBQ',
    leader: 'Sam',
    leaderContact: 'greeneggsandsam@example.com',
    notes: 'Pack up the bikes and meet at the trail head. save the miles for the dirt',
    riders: [{ name: 'Sam', email:  'greeneggsandsam@example.com', additionalGuests: 2}, { name: 'Dana', additionalGuests: 2 }, { name: 'Alex' }],
  },  
  {
    id: '4',
    name: 'Go West, Young Person!',
    startLocation: 'Theo Trailhead',
    departureTime: '11:00',
    distanceMiles: 29,
    difficulty: 'moderate',
    bikeType: 'gravel',
    description: 'A scenic loop through the neighborhoods.',
    leader: 'Andre',
    leaderContact: 'andre@example.com',
    routeLinks: [{
      type: 'strava',
      url: 'https://www.strava.com/routes/3470584088854308878'
    }],
    riders: [{ name: 'Andre', email:  'andre@example.com'}, { name: 'Orvil' }, { name: 'Lana', additionalGuests: 2 }, { name: 'Rachel', additionalGuests: 3 }],
  },  
  {
    id: '5',
    name: 'Novice Branson Loop',
    startLocation: 'France 44',
    departureTime: '1:00',
    distanceMiles: 2.3,
    difficulty: 'very easy',
    bikeType: 'city',
    description: 'Riade around the neighboorhood on whatever bike you want and come join the fun.',
    leader: 'Lisa',
    leaderContact: 'lisa@example.com',
    routeLinks: [{
      type: 'maps',
      url: 'https://www.google.com/maps/dir/France+44+Wines+%26+Spirits,+4351+France+Ave+S,+Minneapolis,+MN+55410/44.9214445,-93.3342987/44.9221244,-93.3390344/44.9268527,-93.3341896/44.9249985,-93.3307975/44.9234069,-93.3304795/@44.9223716,-93.3378996,15.98z/data=!4m13!4m12!1m5!1m1!1s0x87f6272ff65608e9:0xc68c5bc0a9d0c538!2m2!1d-93.3289088!2d44.9227869!1m0!1m0!1m0!1m0!1m0!3e0?entry=ttu&g_ep=EgoyMDI2MDMxOC4xIKXMDSoASAFQAw%3D%3D'
    }],
    riders: [{ name: 'Lisa', email:  'lisa@example.com'}, { name: 'Sarah' }, { name: 'Brett', additionalGuests: 3 }, { name: 'Bob C', additionalGuests: 1 }],
  }
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
