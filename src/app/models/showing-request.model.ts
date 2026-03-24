export type ShowingRequestStatus = 'pending' | 'confirmed' | 'dismissed';

export interface ShowingRequest {
  id: string;
  showingEventId: string;
  saleItemId?: string;
  name: string;
  contact: string;
  status: ShowingRequestStatus;
}
