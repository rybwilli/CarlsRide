import { Component } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { RideService } from '../../services/ride.service';
import { FoodService } from '../../services/food.service';

interface Stats {
  riders: number;
  attendees: number;
  rides: number;
  contributors: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  stats$: Observable<Stats>;
  bbqLocation: string;

  constructor(rideService: RideService, foodService: FoodService) {
    this.bbqLocation = rideService.bbqLocation;
    this.stats$ = combineLatest([rideService.rides$, foodService.items$]).pipe(
      map(([rides, items]) => {
        const allRiders = rides.flatMap(r => r.riders);
        const riders = allRiders.length;
        const attendees = allRiders.reduce((sum, r) => sum + 1 + (r.additionalGuests ?? 0), 0);
        const contributors = new Set(items.map(i => i.broughtBy)).size;
        return { riders, attendees, rides: rides.length, contributors };
      })
    );
  }
}
