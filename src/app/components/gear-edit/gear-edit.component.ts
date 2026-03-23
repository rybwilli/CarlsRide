import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SaleCategory, SaleItemStatus } from '../../models/sale-item.model';
import { SaleService } from '../../services/sale.service';

@Component({
  selector: 'app-gear-edit',
  templateUrl: './gear-edit.component.html',
  styleUrls: ['./gear-edit.component.scss'],
})
export class GearEditComponent implements OnInit {
  itemId = '';
  sellerToken = '';

  name = '';
  description = '';
  price: number | null = null;
  category: SaleCategory = 'bikes';
  seller = '';
  status: SaleItemStatus = 'available';
  images: string[] = [];

  constructor(public saleService: SaleService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.sellerToken = this.route.snapshot.queryParamMap.get('seller') ?? '';
    if (this.sellerToken !== this.saleService.sellerToken) {
      this.router.navigate(['/gear']);
      return;
    }
    this.itemId = this.route.snapshot.paramMap.get('id') ?? '';
    const item = this.saleService.getItem(this.itemId);
    if (!item) { this.router.navigate(['/gear']); return; }

    this.name = item.name;
    this.description = item.description;
    this.price = item.price;
    this.category = item.category;
    this.seller = item.seller;
    this.status = item.status;
    this.images = item.images ? [...item.images] : [];
  }

  get isValid(): boolean {
    return !!(this.name.trim() && this.description.trim() && this.price && this.price > 0 && this.seller.trim());
  }

  onImagesSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => this.images.push(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number): void {
    this.images.splice(index, 1);
  }

  submit(): void {
    if (!this.isValid || this.price === null) return;
    this.saleService.updateItem(this.itemId, {
      name: this.name.trim(),
      description: this.description.trim(),
      price: this.price,
      category: this.category,
      seller: this.seller.trim(),
      status: this.status,
      images: this.images.length ? [...this.images] : undefined,
    });
    this.router.navigate(['/gear'], { queryParams: { seller: this.sellerToken } });
  }

  cancel(): void {
    this.router.navigate(['/gear'], { queryParams: { seller: this.sellerToken } });
  }
}
