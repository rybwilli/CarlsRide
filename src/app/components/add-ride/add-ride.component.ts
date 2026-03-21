import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Difficulty } from '../../models/ride.model';
import { RideService } from '../../services/ride.service';

@Component({
  selector: 'app-add-ride',
  templateUrl: './add-ride.component.html',
  styleUrls: ['./add-ride.component.scss'],
})
export class AddRideComponent {
  bbqLocation: string;

  name = '';
  startLocation = '';
  departureTime = '';
  distanceMiles: number | null = null;
  difficulty: Difficulty = 'moderate';
  leader = '';
  leaderContact = '';
  notes = '';

  difficulties: Difficulty[] = ['easy', 'moderate', 'hard'];

  constructor(private rideService: RideService, private router: Router) {
    this.bbqLocation = rideService.bbqLocation;
  }

  get isValid(): boolean {
    return !!(
      this.name.trim() &&
      this.startLocation.trim() &&
      this.departureTime &&
      this.distanceMiles &&
      this.distanceMiles > 0 &&
      this.leader.trim()
    );
  }

  submit(): void {
    if (!this.isValid || this.distanceMiles === null) return;
    const ride = this.rideService.addRide({
      name: this.name.trim(),
      startLocation: this.startLocation.trim(),
      departureTime: new Date(this.departureTime).toISOString(),
      distanceMiles: this.distanceMiles,
      difficulty: this.difficulty,
      leader: this.leader.trim(),
      leaderContact: this.leaderContact.trim() || undefined,
      notes: this.notes.trim() || undefined,
    });
    this.router.navigate(['/rides', ride.id]);
  }

  cancel(): void {
    this.router.navigate(['/rides']);
  }
}
