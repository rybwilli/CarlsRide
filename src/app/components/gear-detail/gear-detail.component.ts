import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SaleItem, SaleCategory } from '../../models/sale-item.model';
import { SaleService } from '../../services/sale.service';
import { ItemShowingService } from '../../services/item-showing.service';
import { ItemShowingEvent } from '../../models/item-showing.model';
import { ShowingRequestService } from '../../services/showing-request.service';
import { SaleCatalogService } from '../../services/sale-catalog.service';

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

  // Showing request form
  showings: ItemShowingEvent[] = [];
  requestName = '';
  requestContact = '';
  requestShowingEventId = '';
  requestError = '';
  showConfirmPopup = false;

  // After a successful submission, store the details for read-only display
  submittedRequest: { name: string; contact: string; showing: ItemShowingEvent | null } | null = null;

  constructor(
    public saleService: SaleService,
    public itemShowingService: ItemShowingService,
    public showingRequestService: ShowingRequestService,
    public saleCatalogService: SaleCatalogService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.sellerToken = this.route.snapshot.queryParamMap.get('seller') ?? '';
    this.canSell = this.sellerToken === this.saleService.sellerToken;
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.item = this.saleService.getItem(id);
    if (!this.item) { this.router.navigate(['/gear']); return; }

    // Load showings and requests
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

  get isRequestValid(): boolean {
    return !!(this.requestName.trim() && this.requestContact.trim() && this.requestShowingEventId);
  }

  get futureShowings() {
    const now = new Date();
    return this.showings.filter(s => new Date(s.dateTime) > now);
  }

  get selectedShowing() {
    return this.showings.find(s => s.id === this.requestShowingEventId) ?? null;
  }

  get existingRequestForItem() {
    if (!this.item) return null;
    return this.showingRequestService.activeRequestForItem(this.item.id);
  }

  showingForRequest(showingEventId: string): ItemShowingEvent | null {
    return this.showings.find(s => s.id === showingEventId) ?? null;
  }

  openSubmitConfirm(): void {
    if (!this.isRequestValid) return;
    this.showConfirmPopup = true;
  }

  cancelSubmitConfirm(): void {
    this.showConfirmPopup = false;
  }

  async submitRequest(): Promise<void> {
    if (!this.isRequestValid || !this.item) return;
    this.showConfirmPopup = false;
    this.requestError = '';
    try {
      await this.showingRequestService.createRequest({
        showingEventId: this.requestShowingEventId,
        saleItemId: this.item.id,
        name: this.requestName.trim(),
        contact: this.requestContact.trim(),
      });

      // Move the item to pending and reflect locally
      this.saleService.markPending(this.item.id);
      this.item = { ...this.item, status: 'pending' };

      // Store submitted data for read-only display
      this.submittedRequest = {
        name: this.requestName.trim(),
        contact: this.requestContact.trim(),
        showing: this.selectedShowing,
      };
    } catch {
      this.requestError = 'Something went wrong. Please try again.';
    }
  }
}
