import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SaleItem, SaleCategory } from '../../models/sale-item.model';
import { SaleService } from '../../services/sale.service';

@Component({
  selector: 'app-gear-detail',
  templateUrl: './gear-detail.component.html',
  styleUrls: ['./gear-detail.component.scss'],
})
export class GearDetailComponent implements OnInit {
  item: SaleItem | undefined;
  selectedImage = 0;
  sellerToken = '';
  canSell = false;

  constructor(public saleService: SaleService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.sellerToken = this.route.snapshot.queryParamMap.get('seller') ?? '';
    this.canSell = this.sellerToken === this.saleService.sellerToken;
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.item = this.saleService.getItem(id);
    if (!this.item) this.router.navigate(['/gear']);
  }

  getCategoryEmoji(category: SaleCategory): string {
    return this.saleService.categories.find(c => c.value === category)?.emoji ?? '📦';
  }

  goBack(): void {
    const extras = this.canSell ? { queryParams: { seller: this.sellerToken } } : {};
    this.router.navigate(['/gear'], extras);
  }

  editItem(): void {
    this.router.navigate(['/gear', this.item!.id, 'edit'], { queryParams: { seller: this.sellerToken } });
  }
}
