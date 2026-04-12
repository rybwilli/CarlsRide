import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class GearSaleComponent implements OnInit, OnDestroy {
  imageIndexes = new Map<string, number>();
  private imageTimers = new Map<string, ReturnType<typeof setTimeout>>();

  private categoryFilter$!: BehaviorSubject<SaleCategory | 'all'>;
  private activityFilter$!: BehaviorSubject<SaleActivity | 'all'>;
  private conditionFilter$!: BehaviorSubject<SaleCondition | 'all'>;
  private statusFilter$!: BehaviorSubject<SaleItemStatus | 'all'>;
  private searchText$!: BehaviorSubject<string>;
  private priceSort$!: BehaviorSubject<'asc' | 'desc'>;

  filtered$!: Observable<SaleItem[]>;
  totalItems$!: Observable<number>;

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
    { value: 'camping',    label: 'Camping' },
    { value: 'winter',     label: 'Winter' },
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
  expandedShowingIds = new Set<string>();
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

    this.categoryFilter$ = new BehaviorSubject<SaleCategory | 'all'>(saleService.categoryFilter);
    this.activityFilter$ = new BehaviorSubject<SaleActivity | 'all'>(saleService.activityFilter);
    this.conditionFilter$ = new BehaviorSubject<SaleCondition | 'all'>(saleService.conditionFilter);
    this.statusFilter$ = new BehaviorSubject<SaleItemStatus | 'all'>(saleService.statusFilter);
    this.searchText$ = new BehaviorSubject<string>(saleService.searchText);
    this.priceSort$ = new BehaviorSubject<'asc' | 'desc'>(saleService.priceSort);

    this.totalItems$ = saleService.items$.pipe(map(items => items.length));

    saleService.items$.subscribe(items => {
      this.imageTimers.forEach(t => clearTimeout(t));
      this.imageTimers.clear();
      items.filter(i => (i.images?.length ?? 0) > 1).forEach(i => this.scheduleNextImage(i.id, i.images!));
    });

    this.filtered$ = combineLatest([
      saleService.items$,
      this.categoryFilter$,
      this.activityFilter$,
      this.conditionFilter$,
      this.statusFilter$,
      this.searchText$,
      this.priceSort$,
    ]).pipe(
      map(([items, cat, act, cond, status, search, sort]) => {
        const q = search.trim().toLowerCase();
        let result = items.filter(i => {
          if (cat !== 'all' && i.category !== cat) return false;
          if (act !== 'all' && !i.activities?.includes(act)) return false;
          if (cond !== 'all' && i.condition !== cond) return false;
          if (status !== 'all' && i.status !== status) return false;
          if (q && !i.name.toLowerCase().includes(q) && !i.description.toLowerCase().includes(q) && !i.seller.toLowerCase().includes(q)) return false;
          return true;
        });
        result = [...result].sort((a, b) => sort === 'asc' ? a.price - b.price : b.price - a.price);
        return result;
      })
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
      .filter(r => r.status === 'pending' || r.status === 'confirmed');
  }

  toggleRequestsExpanded(showingId: string): void {
    if (this.expandedShowingIds.has(showingId)) {
      this.expandedShowingIds.delete(showingId);
    } else {
      this.expandedShowingIds.add(showingId);
    }
  }

  itemNameForRequest(saleItemId: string | undefined): string {
    if (!saleItemId) return '';
    return this.saleService.getItem(saleItemId)?.name ?? '';
  }

  get futureShowings() {
    const now = new Date();
    return this.showings.filter(s => new Date(s.dateTime) > now);
  }

  get showingsWithInventoryRequests() {
    return this.showings.filter(s => this.inventoryRequestsForShowing(s.id).length > 0);
  }

  setCategoryFilter(f: SaleCategory | 'all'): void { this.categoryFilter$.next(f); this.saleService.categoryFilter = f; }
  setActivityFilter(f: SaleActivity | 'all'): void { this.activityFilter$.next(f); this.saleService.activityFilter = f; }
  setConditionFilter(f: SaleCondition | 'all'): void { this.conditionFilter$.next(f); this.saleService.conditionFilter = f; }
  setStatusFilter(f: SaleItemStatus | 'all'): void { this.statusFilter$.next(f); this.saleService.statusFilter = f; }
  setSearchText(v: string): void { this.searchText$.next(v); this.saleService.searchText = v; }
  setPriceSort(v: 'asc' | 'desc'): void { this.priceSort$.next(v); this.saleService.priceSort = v; }

  get activeCategoryFilter$() { return this.categoryFilter$.asObservable(); }
  get activeActivityFilter$() { return this.activityFilter$.asObservable(); }
  get activeConditionFilter$() { return this.conditionFilter$.asObservable(); }
  get activeStatusFilter$() { return this.statusFilter$.asObservable(); }
  get activeSearchText$() { return this.searchText$.asObservable(); }
  get activePriceSort$() { return this.priceSort$.asObservable(); }

  private scheduleNextImage(id: string, images: string[]): void {
    const delay = (3 + Math.random() * 3) * 1000;
    const timer = setTimeout(() => {
      const current = this.imageIndexes.get(id) ?? 0;
      this.imageIndexes.set(id, (current + 1) % images.length);
      this.scheduleNextImage(id, images);
    }, delay);
    this.imageTimers.set(id, timer);
  }

  getImageIndex(id: string): number {
    return this.imageIndexes.get(id) ?? 0;
  }

  ngOnDestroy(): void {
    this.imageTimers.forEach(t => clearTimeout(t));
  }

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
