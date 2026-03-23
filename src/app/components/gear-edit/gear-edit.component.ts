import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SaleActivity, SaleCategory, SaleCondition, SaleItemStatus } from '../../models/sale-item.model';
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
  activity: SaleActivity | '' = '';
  condition: SaleCondition | '' = '';
  images: string[] = [];

  readonly activities: { value: SaleActivity; label: string }[] = [
    { value: 'road',       label: 'Road' },
    { value: 'mountain',   label: 'Mountain' },
    { value: 'gravel',     label: 'Gravel' },
    { value: 'cyclocross', label: 'Cyclocross' },
    { value: 'commuter',   label: 'Commuter' },
    { value: 'bmx',        label: 'BMX' },
    { value: 'kids',       label: 'Kids' },
    { value: 'general',    label: 'General' },
  ];

  readonly conditions: { value: SaleCondition; label: string }[] = [
    { value: 'new',       label: 'New' },
    { value: 'like new',  label: 'Like New' },
    { value: 'good',      label: 'Good' },
    { value: 'fair',      label: 'Fair' },
    { value: 'poor',      label: 'Poor' },
  ];

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
    this.activity = item.activity ?? '';
    this.condition = item.condition ?? '';
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
      activity: this.activity || undefined,
      condition: this.condition || undefined,
    });
    this.router.navigate(['/gear'], { queryParams: { seller: this.sellerToken } });
  }

  cancel(): void {
    this.router.navigate(['/gear'], { queryParams: { seller: this.sellerToken } });
  }
}
