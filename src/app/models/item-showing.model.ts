export interface ItemShowingEvent {
  id: string;
  saleId: string;
  dateTime: string;
  location: string;
  details?: string;
  contactName: string;
  contactEmail?: string;
}
