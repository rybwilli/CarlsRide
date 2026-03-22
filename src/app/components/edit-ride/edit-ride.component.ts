import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BikeType, Difficulty, RouteLink, RouteLinkType } from '../../models/ride.model';
import { RideService } from '../../services/ride.service';

@Component({
  selector: 'app-edit-ride',
  templateUrl: './edit-ride.component.html',
  styleUrls: ['./edit-ride.component.scss'],
})
export class EditRideComponent implements OnInit {
  bbqLocation: string;
  rideId = '';

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
  routeLinks: RouteLink[] = [];
  newLinkType: RouteLinkType = 'strava';
  newLinkUrl = '';

  difficulties: Difficulty[] = ['very easy', 'easy', 'moderately easy', 'moderate', 'moderately hard', 'hard'];
  bikeTypes: BikeType[] = ['road', 'gravel', 'mountain', 'city'];
  linkTypes: RouteLinkType[] = ['strava', 'gpx', 'maps', 'other'];

  constructor(private route: ActivatedRoute, private router: Router, private rideService: RideService) {
    this.bbqLocation = rideService.bbqLocation;
  }

  ngOnInit(): void {
    this.rideId = this.route.snapshot.paramMap.get('id') ?? '';
    const ride = this.rideService.getRide(this.rideId);
    if (!ride) { this.router.navigate(['/rides']); return; }

    this.name = ride.name;
    this.startLocation = ride.startLocation;
    this.startTime = ride.departureTime;
    this.distanceMiles = ride.distanceMiles;
    this.difficulty = ride.difficulty;
    this.bikeType = ride.bikeType;
    this.description = ride.description;
    this.leader = ride.leader;
    this.leaderContact = ride.leaderContact ?? '';
    this.notes = ride.notes ?? '';
    this.routeLinks = ride.routeLinks ? [...ride.routeLinks] : [];
  }

  get isValid(): boolean {
    return !!(this.name.trim() && this.startLocation.trim() && this.startTime &&
      this.distanceMiles && this.distanceMiles > 0 && this.description.trim() && this.leader.trim());
  }

  addLink(): void {
    if (!this.newLinkUrl.trim()) return;
    this.routeLinks.push({ type: this.newLinkType, url: this.newLinkUrl.trim() });
    this.newLinkUrl = '';
  }

  removeLink(index: number): void {
    this.routeLinks.splice(index, 1);
  }

  submit(): void {
    if (!this.isValid || this.distanceMiles === null) return;
    this.rideService.updateRide(this.rideId, {
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
    this.router.navigate(['/rides', this.rideId]);
  }

  cancel(): void {
    this.router.navigate(['/rides', this.rideId]);
  }
}
