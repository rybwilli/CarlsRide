import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AppEvent, EventService } from '../../services/event.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  allEvents$: Observable<AppEvent[]>;
  activeEvent$: Observable<AppEvent>;

  editingId: string | null = null;
  deletingEvent: AppEvent | null = null;

  // Create form
  newName = '';
  newDate = '';
  newGatheringTime = '';
  newLocation = '';
  newDescription = '';

  // Edit form
  editName = '';
  editDate = '';
  editGatheringTime = '';
  editLocation = '';
  editDescription = '';

  constructor(public eventService: EventService, private router: Router, route: ActivatedRoute) {
    this.allEvents$ = eventService.allEvents$;
    this.activeEvent$ = eventService.event$;

    const token = route.snapshot.queryParamMap.get('admin') ?? '';
    if (token !== eventService.adminToken) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.eventService.loadOrCreateEvent();
  }

  get isCreateValid(): boolean {
    return !!(this.newName.trim() && this.newDate && this.newGatheringTime.trim() && this.newLocation.trim());
  }

  async createEvent(): Promise<void> {
    if (!this.isCreateValid) return;
    await this.eventService.createEvent({
      name: this.newName.trim(),
      date: this.newDate,
      gatheringTime: this.newGatheringTime.trim(),
      location: this.newLocation.trim(),
      description: this.newDescription.trim() || undefined,
    });
    this.newName = '';
    this.newDate = '';
    this.newGatheringTime = '';
    this.newLocation = '';
    this.newDescription = '';
  }

  startEdit(event: AppEvent): void {
    this.editingId = event.id;
    this.editName = event.name;
    this.editDate = event.date;
    this.editGatheringTime = event.gatheringTime;
    this.editLocation = event.location;
    this.editDescription = event.description ?? '';
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  async saveEdit(): Promise<void> {
    if (!this.editingId) return;
    await this.eventService.updateEvent(this.editingId, {
      name: this.editName.trim(),
      date: this.editDate,
      gatheringTime: this.editGatheringTime.trim(),
      location: this.editLocation.trim(),
      description: this.editDescription.trim() || undefined,
    });
    this.editingId = null;
  }

  setActive(event: AppEvent): void {
    this.eventService.setActiveEvent(event);
  }

  deleteEvent(event: AppEvent): void {
    this.deletingEvent = event;
  }

  cancelDelete(): void {
    this.deletingEvent = null;
  }

  async confirmDelete(): Promise<void> {
    if (!this.deletingEvent) return;
    await this.eventService.deleteEvent(this.deletingEvent.id);
    this.deletingEvent = null;
  }
}
