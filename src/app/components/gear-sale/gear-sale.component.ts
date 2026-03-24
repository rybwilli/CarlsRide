import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, map, BehaviorSubject } from 'rxjs';
import { SaleItem, SaleActivity, SaleCategory, SaleCondition, SaleItemStatus } from '../../models/sale-item.model';
import { SaleService } from '../../services/sale.service';
import { SaleCatalogService } from '../../services/sale-catalog.service';

@Component({
  selector: 'app-gear-sale',
  templateUrl: './gear-sale.component.html',
  styleUrls: ['./gear-sale.component.scss'],
})
export class GearSaleComponent {
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

  activeSaleName$ = this.saleCatalogService.activeSale$.pipe(map(s => s.name));

  constructor(public saleService: SaleService, public saleCatalogService: SaleCatalogService, private router: Router, route: ActivatedRoute) {
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
}
