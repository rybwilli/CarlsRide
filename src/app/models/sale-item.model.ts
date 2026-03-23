export type SaleItemStatus = 'available' | 'pending' | 'sold';
export type SaleCategory = 'bikes' | 'parts' | 'wheels' | 'tires' | 'tools' | 'helmets' | 'clothing' | 'accessories' | 'other';
export type SaleActivity = 'road' | 'mountain' | 'gravel' | 'cyclocross' | 'commuter' | 'bmx' | 'kids' | 'general';
export type SaleCondition = 'new' | 'like new' | 'good' | 'fair' | 'poor';

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
  activity?: SaleActivity;
  condition?: SaleCondition;
}
