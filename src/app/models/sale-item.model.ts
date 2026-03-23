export type SaleItemStatus = 'available' | 'pending' | 'sold';
export type SaleCategory = 'bikes' | 'parts' | 'wheels' | 'tires' | 'tools' | 'clothing' | 'accessories' | 'other';

export interface SaleItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: SaleCategory;
  status: SaleItemStatus;
  seller: string;
  images?: string[];
  quantity?: number;
}
