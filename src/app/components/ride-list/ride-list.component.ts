import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Ride } from '../../models/ride.model';
import { RideService } from '../../services/ride.service';

@Component({
  selector: 'app-ride-list',
  templateUrl: './ride-list.component.html',
  styleUrls: ['./ride-list.component.scss'],
})
export class RideListComponent {
  rides$: Observable<Ride[]>;
  bbqLocation: string;
  bikeEmoji: Record<string, string> = {
    road: '⚡', mountain: '🌲', gravel: '🪨', city: '🏙️',
  };

  constructor(private rideService: RideService, private router: Router) {
    this.rides$ = rideService.rides$;
    this.bbqLocation = rideService.bbqLocation;
  }

  goToRide(id: string): void {
    this.router.navigate(['/rides', id]);
  }

  addRide(): void {
    this.router.navigate(['/rides/new']);
  }
}
