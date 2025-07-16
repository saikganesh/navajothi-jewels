
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

export interface ProductVariation {
  id: string;
  parent_product_id: string;
  variation_name: string;
  description: string | null;
  price: number | null;
  net_weight: number | null;
  images: any;
  in_stock: boolean;
  gross_weight: number | null;
  stone_weight: number | null;
  karat: string | null;
  karat_22kt_gross_weight: number | null;
  karat_22kt_stone_weight: number | null;
  karat_22kt_net_weight: number | null;
  karat_18kt_gross_weight: number | null;
  karat_18kt_stone_weight: number | null;
  karat_18kt_net_weight: number | null;
  available_karats: string[] | null;
}

export interface CartItem extends Product {
  quantity: number;
}
