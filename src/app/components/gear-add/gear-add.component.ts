import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SaleActivity, SaleCategory, SaleCondition } from '../../models/sale-item.model';
import { SaleService } from '../../services/sale.service';
import { uploadData, getUrl } from 'aws-amplify/storage';

@Component({
  selector: 'app-gear-add',
  templateUrl: './gear-add.component.html',
  styleUrls: ['./gear-add.component.scss'],
})
export class GearAddComponent {
  sellerToken: string;

  name = '';
  description = '';
  price: number | null = null;
  category: SaleCategory = 'bikes';
  selectedActivities: SaleActivity[] = [];
  condition: SaleCondition | '' = '';
  comparableSite = '';
  highPrice: number | null = null;
  additionalListingUrl = '';
  seller = '';
  images: string[] = [];
  allowMultipleSales = false;

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
    { value: 'camping',    label: 'Camping' },
    { value: 'winter',     label: 'Winter' },
    { value: 'general',    label: 'General' },
  ];

  readonly conditions: { value: SaleCondition; label: string }[] = [
    { value: 'new',       label: 'New' },
    { value: 'like new',  label: 'Like New' },
    { value: 'good',      label: 'Good' },
    { value: 'fair',      label: 'Fair' },
    { value: 'poor',      label: 'Poor' },
  ];

  constructor(public saleService: SaleService, private router: Router, route: ActivatedRoute) {
    this.sellerToken = route.snapshot.queryParamMap.get('seller') ?? '';
    if (this.sellerToken !== saleService.sellerToken) {
      this.router.navigate(['/gear']);
    }
  }

  get isValid(): boolean {
    return !!(this.name.trim() && this.description.trim() && this.price && this.price > 0 && this.seller.trim());
  }

  onImagesSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;
    Array.from(files).forEach(file => this.compressAndUpload(file));
  }

  private compressAndUpload(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        const MAX = 800;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const key = `sale-items/${Date.now()}-${file.name}`;
          await uploadData({ key, data: blob, options: { accessLevel: 'guest', contentType: 'image/jpeg' } }).result;
          const { url } = await getUrl({ key, options: { accessLevel: 'guest' } });
          this.images.push(url.toString());
        }, 'image/jpeg', 0.7);
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeImage(index: number): void {
    this.images.splice(index, 1);
  }

  toggleActivity(value: SaleActivity): void {
    const idx = this.selectedActivities.indexOf(value);
    if (idx >= 0) this.selectedActivities.splice(idx, 1);
    else this.selectedActivities.push(value);
  }

  isActivitySelected(value: SaleActivity): boolean {
    return this.selectedActivities.includes(value);
  }

  submitError = '';
  submitting = false;

  async submit(): Promise<void> {
    if (!this.isValid || this.price === null) return;
    this.submitting = true;
    this.submitError = '';
    try {
      await this.saleService.addItem({
        name: this.name.trim(),
        description: this.description.trim(),
        price: this.price,
        category: this.category,
        seller: this.seller.trim(),
        images: this.images.length ? [...this.images] : undefined,
        activities: this.selectedActivities.length ? [...this.selectedActivities] : undefined,
        condition: this.condition || undefined,
        comparableSite: this.comparableSite.trim() || undefined,
        allowMultipleSales: this.allowMultipleSales || undefined,
        highPrice: this.highPrice ?? undefined,
        additionalListingUrl: this.additionalListingUrl.trim() || undefined,
      });
      this.router.navigate(['/gear'], { queryParams: { seller: this.sellerToken } });
    } catch {
      this.submitError = 'Failed to save item. Please try again.';
      this.submitting = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/gear'], { queryParams: { seller: this.sellerToken } });
  }
}
