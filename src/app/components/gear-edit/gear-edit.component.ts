import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SaleActivity, SaleCategory, SaleCondition, SaleItemStatus } from '../../models/sale-item.model';
import { SaleService } from '../../services/sale.service';
import { SaleCatalogService } from '../../services/sale-catalog.service';
import { Sale } from '../../models/sale.model';
import { uploadData, getUrl } from 'aws-amplify/storage';

@Component({
  selector: 'app-gear-edit',
  templateUrl: './gear-edit.component.html',
  styleUrls: ['./gear-edit.component.scss'],
})
export class GearEditComponent implements OnInit {
  itemId = '';
  sellerToken = '';
  sales: Sale[] = [];
  selectedSaleId = '';

  name = '';
  description = '';
  price: number | null = null;
  category: SaleCategory = 'bikes';
  seller = '';
  status: SaleItemStatus = 'available';
  selectedActivities: SaleActivity[] = [];
  comparableSite = '';
  highPrice: number | null = null;
  additionalListingUrl = '';
  condition: SaleCondition | '' = '';
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

  constructor(
    public saleService: SaleService,
    public saleCatalogService: SaleCatalogService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    saleCatalogService.allSales$.subscribe(sales => { this.sales = sales; });
  }

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
    this.highPrice = item.highPrice ?? null;
    this.additionalListingUrl = item.additionalListingUrl ?? '';
    this.condition = item.condition ?? '';
    this.images = item.images ? [...item.images] : [];
    this.allowMultipleSales = item.allowMultipleSales ?? false;
    this.selectedSaleId = item.saleId ?? this.saleCatalogService.activeSale?.id ?? '';
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

  submitError = '';
  submitting = false;
  showDeleteConfirm = false;

  async deleteItem(): Promise<void> {
    await this.saleService.deleteItem(this.itemId);
    this.router.navigate(['/gear'], { queryParams: { seller: this.sellerToken } });
  }

  async submit(): Promise<void> {
    if (!this.isValid || this.price === null) return;
    this.submitting = true;
    this.submitError = '';
    try {
      await this.saleService.updateItem(this.itemId, {
        saleId: this.selectedSaleId || undefined,
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
        allowMultipleSales: this.allowMultipleSales || undefined,
        highPrice: this.highPrice ?? undefined,
        additionalListingUrl: this.additionalListingUrl.trim() || undefined,
      });
      this.router.navigate(['/gear'], { queryParams: { seller: this.sellerToken } });
    } catch {
      this.submitError = 'Failed to save changes. Please try again.';
      this.submitting = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/gear'], { queryParams: { seller: this.sellerToken } });
  }
}
