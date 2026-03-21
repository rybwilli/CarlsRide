import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Ride } from '../../models/ride.model';
import { RideService } from '../../services/ride.service';

@Component({
  selector: 'app-ride-detail',
  templateUrl: './ride-detail.component.html',
  styleUrls: ['./ride-detail.component.scss'],
})
export class RideDetailComponent implements OnInit {
  ride: Ride | undefined;
  bbqLocation: string;
  joinName = '';
  joinEmail = '';
  joined = false;
  alreadyJoined = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rideService: RideService
  ) {
    this.bbqLocation = rideService.bbqLocation;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.ride = this.rideService.getRide(id);
  }

  joinRide(): void {
    if (!this.ride || !this.joinName.trim()) return;
    this.rideService.joinRide(this.ride.id, {
      name: this.joinName.trim(),
      email: this.joinEmail.trim() || undefined,
    });
    this.ride = this.rideService.getRide(this.ride.id);
    this.joined = true;
    this.joinName = '';
    this.joinEmail = '';
  }

  goBack(): void {
    this.router.navigate(['/rides']);
  }
}
