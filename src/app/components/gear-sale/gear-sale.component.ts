import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, map, BehaviorSubject } from 'rxjs';
import { SaleItem, SaleActivity, SaleCategory, SaleCondition, SaleItemStatus } from '../../models/sale-item.model';
import { SaleService } from '../../services/sale.service';
import { SaleCatalogService } from '../../services/sale-catalog.service';
import { ItemShowingService } from '../../services/item-showing.service';
import { ItemShowingEvent } from '../../models/item-showing.model';
import { ShowingRequestService } from '../../services/showing-request.service';

@Component({
  selector: 'app-gear-sale',
  templateUrl: './gear-sale.component.html',
  styleUrls: ['./gear-sale.component.scss'],
})
export class GearSaleComponent implements OnInit {
  private categoryFilter$ = new BehaviorSubject<SaleCategory | 'all'>('all');
  private activityFilter$ = new BehaviorSubject<SaleActivity | 'all'>('all');
  private conditionFilter$ = new BehaviorSubject<SaleCondition | 'all'>('all');
  private statusFilter$ = new BehaviorSubject<SaleItemStatus | 'all'>('all');

  filtered$: Observable<SaleItem[]>;

  categoryFilters = [
    { value: 'all' as SaleCategory | 'all', label: 'All', emoji: '🛒' },
    ...this.saleService.categories,
  ];

  activityFilters: { value: SaleActivity | 'all'; label: string }[] = [
    { value: 'all',        label: 'All' },
    { value: 'road',       label: 'Road' },
    { value: 'mountain',   label: 'Mountain' },
    { value: 'gravel',     label: 'Gravel' },
    { value: 'cyclocross', label: 'Cyclocross' },
    { value: 'commuter',   label: 'Commuter' },
    { value: 'bmx',        label: 'BMX' },
    { value: 'kids',       label: 'Kids' },
    { value: 'ski',        label: 'Ski' },
    { value: 'skate',      label: 'Skate' },
    { value: 'general',    label: 'General' },
  ];

  conditionFilters: { value: SaleCondition | 'all'; label: string }[] = [
    { value: 'all',       label: 'All' },
    { value: 'new',       label: 'New' },
    { value: 'like new',  label: 'Like New' },
    { value: 'good',      label: 'Good' },
    { value: 'fair',      label: 'Fair' },
    { value: 'poor',      label: 'Poor' },
  ];

  statusFilters: { value: SaleItemStatus | 'all'; label: string }[] = [
    { value: 'all',       label: 'All' },
    { value: 'available', label: 'Available' },
    { value: 'pending',   label: 'Pending' },
    { value: 'sold',      label: 'Sold' },
  ];

  venmoUsername: string;
  canSell = false;
  sellerToken = '';
  showSaleInfo = false;

  activeSaleName$ = this.saleCatalogService.activeSale$.pipe(map(s => s.name));

  // Full inventory showing request
  showings: ItemShowingEvent[] = [];
  showInventoryModal = false;
  inventoryModalStep: 'list' | 'form' | 'confirm' | 'success' = 'list';
  inventoryRequestName = '';
  inventoryRequestContact = '';
  inventoryRequestShowingEventId = '';
  inventoryRequestError = '';

  constructor(
    public saleService: SaleService,
    public saleCatalogService: SaleCatalogService,
    public itemShowingService: ItemShowingService,
    public showingRequestService: ShowingRequestService,
    private router: Router,
    route: ActivatedRoute,
  ) {
    this.venmoUsername = saleService.venmoUsername;
    this.sellerToken = route.snapshot.queryParamMap.get('seller') ?? '';
    this.canSell = this.sellerToken === saleService.sellerToken;

    this.filtered$ = combineLatest([
      saleService.items$,
      this.categoryFilter$,
      this.activityFilter$,
      this.conditionFilter$,
      this.statusFilter$,
    ]).pipe(
      map(([items, cat, act, cond, status]) => items.filter(i => {
        if (cat !== 'all' && i.category !== cat) return false;
        if (act !== 'all' && !i.activities?.includes(act)) return false;
        if (cond !== 'all' && i.condition !== cond) return false;
        if (status !== 'all' && i.status !== status) return false;
        return true;
      }))
    );
  }

  ngOnInit(): void {
    Promise.all([
      this.itemShowingService.loadShowings(),
      this.showingRequestService.loadRequests(),
    ]).then(() => {
      const activeSale = this.saleCatalogService.activeSale;
      if (activeSale) {
        this.showings = this.itemShowingService.showingsForSale(activeSale.id);
      }
    });
  }

  inventoryRequestsForShowing(showingEventId: string) {
    return this.showingRequestService.requestsForShowing(showingEventId)
      .filter(r => !r.saleItemId && (r.status === 'pending' || r.status === 'confirmed'));
  }

  get futureShowings() {
    const now = new Date();
    return this.showings.filter(s => new Date(s.dateTime) > now);
  }

  get showingsWithInventoryRequests() {
    return this.showings.filter(s => this.inventoryRequestsForShowing(s.id).length > 0);
  }

  setCategoryFilter(f: SaleCategory | 'all'): void { this.categoryFilter$.next(f); }
  setActivityFilter(f: SaleActivity | 'all'): void { this.activityFilter$.next(f); }
  setConditionFilter(f: SaleCondition | 'all'): void { this.conditionFilter$.next(f); }
  setStatusFilter(f: SaleItemStatus | 'all'): void { this.statusFilter$.next(f); }

  get activeCategoryFilter$() { return this.categoryFilter$.asObservable(); }
  get activeActivityFilter$() { return this.activityFilter$.asObservable(); }
  get activeConditionFilter$() { return this.conditionFilter$.asObservable(); }
  get activeStatusFilter$() { return this.statusFilter$.asObservable(); }

  getCategoryEmoji(category: SaleCategory): string {
    return this.saleService.categories.find(c => c.value === category)?.emoji ?? '📦';
  }

  addItem(): void {
    this.router.navigate(['/gear/new'], { queryParams: { seller: this.sellerToken } });
  }

  viewItem(id: string): void {
    const extras = this.canSell ? { queryParams: { seller: this.sellerToken } } : {};
    this.router.navigate(['/gear', id], extras);
  }

  editItem(id: string): void {
    this.router.navigate(['/gear', id, 'edit'], { queryParams: { seller: this.sellerToken } });
  }

  // ── Full inventory showing request ──────────────────

  openInventoryModal(): void {
    this.showInventoryModal = true;
    this.inventoryModalStep = 'list';
    this.inventoryRequestName = '';
    this.inventoryRequestContact = '';
    this.inventoryRequestShowingEventId = '';
    this.inventoryRequestError = '';
  }

  closeInventoryModal(): void {
    this.showInventoryModal = false;
  }

  startInventoryRequest(showingId: string): void {
    this.inventoryRequestShowingEventId = showingId;
    this.inventoryRequestName = '';
    this.inventoryRequestContact = '';
    this.inventoryRequestError = '';
    this.inventoryModalStep = 'form';
  }

  backToList(): void {
    this.inventoryModalStep = 'list';
  }

  get inventorySelectedShowing(): ItemShowingEvent | null {
    return this.showings.find(s => s.id === this.inventoryRequestShowingEventId) ?? null;
  }

  get isInventoryRequestValid(): boolean {
    return !!(this.inventoryRequestName.trim() && this.inventoryRequestContact.trim() && this.inventoryRequestShowingEventId);
  }

  async submitInventoryRequest(): Promise<void> {
    if (!this.isInventoryRequestValid) return;
    this.inventoryModalStep = 'confirm';
  }

  async confirmInventoryRequest(): Promise<void> {
    this.inventoryRequestError = '';
    try {
      await this.showingRequestService.createRequest({
        showingEventId: this.inventoryRequestShowingEventId,
        name: this.inventoryRequestName.trim(),
        contact: this.inventoryRequestContact.trim(),
      });
      this.inventoryModalStep = 'success';
    } catch {
      this.inventoryRequestError = 'Something went wrong. Please try again.';
      this.inventoryModalStep = 'form';
    }
  }
}
