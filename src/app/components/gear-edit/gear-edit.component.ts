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
  selectedActivities: SaleActivity[] = [];
  comparableSite = '';
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
    { value: 'ski',        label: 'Ski' },
    { value: 'skate',      label: 'Skate' },
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
    this.selectedActivities = item.activities ? [...item.activities] : [];
    this.comparableSite = item.comparableSite ?? '';
    this.condition = item.condition ?? '';
    this.images = item.images ? [...item.images] : [];
  }

  get isValid(): boolean {
    return !!(this.name.trim() && this.description.trim() && this.price && this.price > 0 && this.seller.trim());
  }

  toggleActivity(value: SaleActivity): void {
    const idx = this.selectedActivities.indexOf(value);
    if (idx >= 0) this.selectedActivities.splice(idx, 1);
    else this.selectedActivities.push(value);
  }

  isActivitySelected(value: SaleActivity): boolean {
    return this.selectedActivities.includes(value);
  }

  onImagesSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;
    Array.from(files).forEach(file => this.compressAndAdd(file));
  }

  private compressAndAdd(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 800;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        this.images.push(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
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
      activities: this.selectedActivities.length ? [...this.selectedActivities] : undefined,
      condition: this.condition || undefined,
      comparableSite: this.comparableSite.trim() || undefined,
    });
    this.router.navigate(['/gear'], { queryParams: { seller: this.sellerToken } });
  }

  cancel(): void {
    this.router.navigate(['/gear'], { queryParams: { seller: this.sellerToken } });
  }
}
