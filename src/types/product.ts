
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
}

export interface CartItem extends Product {
  quantity: number;
}
