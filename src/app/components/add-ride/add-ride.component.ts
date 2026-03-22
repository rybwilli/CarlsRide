import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BikeType, Difficulty, RouteLink, RouteLinkType } from '../../models/ride.model';
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
  startTime = '';
  distanceMiles: number | null = null;
  difficulty: Difficulty = 'moderate';
  bikeType: BikeType = 'road';
  description = '';
  leader = '';
  leaderContact = '';
  notes = '';

  difficulties: Difficulty[] = ['very easy', 'easy', 'moderately easy', 'moderate', 'moderately hard', 'hard'];
  bikeTypes: BikeType[] = ['road', 'gravel', 'mountain', 'city'];
  linkTypes: RouteLinkType[] = ['strava', 'gpx', 'maps', 'other'];
  routeLinks: RouteLink[] = [];
  newLinkType: RouteLinkType = 'strava';
  newLinkUrl = '';

  constructor(private rideService: RideService, private router: Router) {
    this.bbqLocation = rideService.bbqLocation;
  }

  get isValid(): boolean {
    return !!(
      this.name.trim() &&
      this.startLocation.trim() &&
      this.startTime &&
      this.distanceMiles &&
      this.distanceMiles > 0 &&
      this.description.trim() &&
      this.leader.trim()
    );
  }

  submit(): void {
    if (!this.isValid || this.distanceMiles === null) return;
    const ride = this.rideService.addRide({
      name: this.name.trim(),
      startLocation: this.startLocation.trim(),
      departureTime: this.startTime,
      distanceMiles: this.distanceMiles,
      difficulty: this.difficulty,
      bikeType: this.bikeType,
      description: this.description.trim(),
      leader: this.leader.trim(),
      leaderContact: this.leaderContact.trim() || undefined,
      notes: this.notes.trim() || undefined,
      routeLinks: this.routeLinks.length ? [...this.routeLinks] : undefined,
    });
    this.router.navigate(['/rides', ride.id]);
  }

  addLink(): void {
    if (!this.newLinkUrl.trim()) return;
    this.routeLinks.push({ type: this.newLinkType, url: this.newLinkUrl.trim() });
    this.newLinkUrl = '';
  }

  removeLink(index: number): void {
    this.routeLinks.splice(index, 1);
  }

  cancel(): void {
    this.router.navigate(['/rides']);
  }
}
