import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { Ride } from '../../models/ride.model';
import { RideService } from '../../services/ride.service';
import { EventAttendee, EventAttendeeService } from '../../services/event-attendee.service';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-ride-list',
  templateUrl: './ride-list.component.html',
  styleUrls: ['./ride-list.component.scss'],
})
export class RideListComponent implements OnInit {
  rides$: Observable<Ride[]>;
  attendees$: Observable<EventAttendee[]>;
  totalAttendees$: Observable<number>;
  bbqLocation: string;
  bikeEmoji: Record<string, string> = {
    road: '⚡', mountain: '🌲', gravel: '🪨', city: '🏙️',
  };

  constructor(
    private rideService: RideService,
    private router: Router,
    private eventAttendeeService: EventAttendeeService,
    private eventService: EventService,
  ) {
    this.rides$ = rideService.rides$;
    this.bbqLocation = rideService.bbqLocation;
    this.attendees$ = eventAttendeeService.attendees$;
    this.totalAttendees$ = this.attendees$.pipe(
      map(list => list.reduce((sum, a) => sum + 1 + (a.additionalPeople ?? 0), 0))
    );
  }

  ngOnInit(): void {
    this.eventAttendeeService.loadAttendees(this.eventService.currentEvent.id);
  }

  goToRide(id: string): void {
    this.router.navigate(['/rides', id]);
  }

  addRide(): void {
    this.router.navigate(['/rides/new']);
  }

  goCelebration(): void {
    this.router.navigate(['/celebration']);
  }
}
