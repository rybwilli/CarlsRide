import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AppEvent, EventService } from '../../services/event.service';
import { Sale } from '../../models/sale.model';
import { SaleCatalogService } from '../../services/sale-catalog.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  // Events
  allEvents$: Observable<AppEvent[]>;
  activeEvent$: Observable<AppEvent>;
  editingEventId: string | null = null;
  deletingEvent: AppEvent | null = null;

  newEventName = '';
  newDate = '';
  newGatheringTime = '';
  newLocation = '';
  newEventDescription = '';

  editEventName = '';
  editDate = '';
  editGatheringTime = '';
  editLocation = '';
  editEventDescription = '';

  // Sales
  allSales$: Observable<Sale[]>;
  activeSale$: Observable<Sale>;
  editingSaleId: string | null = null;
  deletingSale: Sale | null = null;

  newSaleName = '';
  newSaleDescription = '';

  editSaleName = '';
  editSaleDescription = '';

  constructor(
    public eventService: EventService,
    public saleCatalogService: SaleCatalogService,
    private router: Router,
    route: ActivatedRoute
  ) {
    this.allEvents$ = eventService.allEvents$;
    this.activeEvent$ = eventService.event$;
    this.allSales$ = saleCatalogService.allSales$;
    this.activeSale$ = saleCatalogService.activeSale$;

    const token = route.snapshot.queryParamMap.get('admin') ?? '';
    if (token !== eventService.adminToken) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.eventService.loadOrCreateEvent();
    this.saleCatalogService.loadOrCreateSale();
  }

  // ── Events ──────────────────────────────────────────

  get isCreateEventValid(): boolean {
    return !!(this.newEventName.trim() && this.newDate && this.newGatheringTime.trim() && this.newLocation.trim());
  }

  async createEvent(): Promise<void> {
    if (!this.isCreateEventValid) return;
    await this.eventService.createEvent({
      name: this.newEventName.trim(),
      date: this.newDate,
      gatheringTime: this.newGatheringTime.trim(),
      location: this.newLocation.trim(),
      description: this.newEventDescription.trim() || undefined,
    });
    this.newEventName = '';
    this.newDate = '';
    this.newGatheringTime = '';
    this.newLocation = '';
    this.newEventDescription = '';
  }

  startEditEvent(event: AppEvent): void {
    this.editingEventId = event.id;
    this.editEventName = event.name;
    this.editDate = event.date;
    this.editGatheringTime = event.gatheringTime;
    this.editLocation = event.location;
    this.editEventDescription = event.description ?? '';
  }

  cancelEditEvent(): void { this.editingEventId = null; }

  async saveEditEvent(): Promise<void> {
    if (!this.editingEventId) return;
    await this.eventService.updateEvent(this.editingEventId, {
      name: this.editEventName.trim(),
      date: this.editDate,
      gatheringTime: this.editGatheringTime.trim(),
      location: this.editLocation.trim(),
      description: this.editEventDescription.trim() || undefined,
    });
    this.editingEventId = null;
  }

  setActiveEvent(event: AppEvent): void { this.eventService.setActiveEvent(event); }
  deleteEvent(event: AppEvent): void { this.deletingEvent = event; }
  cancelDeleteEvent(): void { this.deletingEvent = null; }

  async confirmDeleteEvent(): Promise<void> {
    if (!this.deletingEvent) return;
    await this.eventService.deleteEvent(this.deletingEvent.id);
    this.deletingEvent = null;
  }

  // ── Sales ──────────────────────────────────────────

  get isCreateSaleValid(): boolean {
    return !!this.newSaleName.trim();
  }

  async createSale(): Promise<void> {
    if (!this.isCreateSaleValid) return;
    await this.saleCatalogService.createSale({
      name: this.newSaleName.trim(),
      description: this.newSaleDescription.trim() || undefined,
      isActive: false,
    });
    this.newSaleName = '';
    this.newSaleDescription = '';
  }

  startEditSale(sale: Sale): void {
    this.editingSaleId = sale.id;
    this.editSaleName = sale.name;
    this.editSaleDescription = sale.description ?? '';
  }

  cancelEditSale(): void { this.editingSaleId = null; }

  async saveEditSale(): Promise<void> {
    if (!this.editingSaleId) return;
    await this.saleCatalogService.updateSale(this.editingSaleId, {
      name: this.editSaleName.trim(),
      description: this.editSaleDescription.trim() || undefined,
    });
    this.editingSaleId = null;
  }

  async setActiveSale(sale: Sale): Promise<void> { await this.saleCatalogService.setActiveSale(sale); }
  deleteSale(sale: Sale): void { this.deletingSale = sale; }
  cancelDeleteSale(): void { this.deletingSale = null; }

  async confirmDeleteSale(): Promise<void> {
    if (!this.deletingSale) return;
    await this.saleCatalogService.deleteSale(this.deletingSale.id);
    this.deletingSale = null;
  }
}
