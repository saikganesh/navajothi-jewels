
export interface Product {
  id: string;
  name: string;
  description: string;
  price?: number; // Made optional since price is calculated dynamically
  image: string;
  category: string;
  inStock: boolean;
  weight?: string;
  purity?: string;
  available_karats?: string[];
  making_charge_percentage?: number;
  discount_percentage?: number | null;
  apply_same_mc?: boolean;
  apply_same_discount?: boolean;
  product_type?: string;
  stock_quantity?: number;
  category_id?: string;
  collection_ids?: string[];
  net_weight?: number; // Added net_weight property
}

export interface ProductVariation {
  id: string;
  parent_product_id: string;
  variation_name: string;
  description: string | null;
  price?: number | null; // Made optional since price is calculated dynamically
  images: any;
  in_stock: boolean;
  available_karats: string[] | null;
  making_charge_percentage?: number;
  discount_percentage?: number | null;
  product_type?: string;
}

export interface CartItem extends Product {
  quantity: number;
  net_weight?: number; // Explicitly include net_weight for cart items
}
