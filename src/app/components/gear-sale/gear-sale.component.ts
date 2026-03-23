import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, map, BehaviorSubject } from 'rxjs';
import { SaleItem, SaleCategory } from '../../models/sale-item.model';
import { SaleService } from '../../services/sale.service';

interface CategorySection {
  value: SaleCategory | 'all';
  label: string;
  emoji: string;
}

@Component({
  selector: 'app-gear-sale',
  templateUrl: './gear-sale.component.html',
  styleUrls: ['./gear-sale.component.scss'],
})
export class GearSaleComponent {
  private filterSubject = new BehaviorSubject<SaleCategory | 'all'>('all');
  filter$ = this.filterSubject.asObservable();
  filtered$: Observable<SaleItem[]>;

  filters: CategorySection[] = [
    { value: 'all', label: 'All', emoji: '🛒' },
    ...this.saleService.categories.map(c => ({ value: c.value as SaleCategory | 'all', label: c.label, emoji: c.emoji })),
  ];

  venmoUsername: string;
  canSell = false;
  sellerToken = '';

  constructor(public saleService: SaleService, private router: Router, route: ActivatedRoute) {
    this.venmoUsername = saleService.venmoUsername;
    this.sellerToken = route.snapshot.queryParamMap.get('seller') ?? '';
    this.canSell = this.sellerToken === saleService.sellerToken;
    this.filtered$ = combineLatest([saleService.items$, this.filter$]).pipe(
      map(([items, filter]) => filter === 'all' ? items : items.filter(i => i.category === filter))
    );
  }

  setFilter(f: SaleCategory | 'all'): void {
    this.filterSubject.next(f);
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
}
