import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { EventAttendee, EventAttendeeService } from '../../services/event-attendee.service';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-celebration-detail',
  templateUrl: './celebration-detail.component.html',
  styleUrls: ['./celebration-detail.component.scss'],
})
export class CelebrationDetailComponent implements OnInit {
  attendees$: Observable<EventAttendee[]>;
  totalAttendees$: Observable<number>;

  addName = '';
  addAdditionalPeople = 0;
  addEmail = '';
  addContact = '';
  submitting = false;
  joined = false;

  constructor(
    private router: Router,
    private eventAttendeeService: EventAttendeeService,
    private eventService: EventService,
  ) {
    this.attendees$ = eventAttendeeService.attendees$;
    this.totalAttendees$ = this.attendees$.pipe(
      map(list => list.reduce((sum, a) => sum + 1 + (a.additionalPeople ?? 0), 0))
    );
  }

  ngOnInit(): void {
    this.eventAttendeeService.loadAttendees(this.eventService.currentEvent.id);
  }

  get isValid(): boolean {
    return !!this.addName.trim();
  }

  async submit(): Promise<void> {
    if (!this.isValid || this.submitting) return;
    this.submitting = true;
    await this.eventAttendeeService.createAttendee({
      eventId: this.eventService.currentEvent.id,
      name: this.addName.trim(),
      additionalPeople: this.addAdditionalPeople ?? 0,
      email: this.addEmail.trim() || undefined,
      contact: this.addContact.trim() || undefined,
    });
    this.addName = '';
    this.addAdditionalPeople = 0;
    this.addEmail = '';
    this.addContact = '';
    this.submitting = false;
    this.joined = true;
  }

  async remove(id: string): Promise<void> {
    await this.eventAttendeeService.deleteAttendee(id);
  }

  goBack(): void {
    this.router.navigate(['/rides']);
  }
}
