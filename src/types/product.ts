
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  weight?: string;
  purity?: string;
  net_weight?: number;
  karat?: string;
  karat_22kt_gross_weight?: number;
  karat_22kt_stone_weight?: number;
  karat_22kt_net_weight?: number;
  karat_18kt_gross_weight?: number;
  karat_18kt_stone_weight?: number;
  karat_18kt_net_weight?: number;
  available_karats?: string[];
}

export interface CartItem extends Product {
  quantity: number;
}
