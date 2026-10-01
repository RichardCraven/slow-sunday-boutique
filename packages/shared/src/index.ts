export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  stock: number;
  artisanName: string;
  badge?: 'Bestseller' | 'Popular' | 'Handmade' | 'Rare Find';
  tags: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  currency: string;
  customerEmail: string;
  shippingAddress: ShippingAddress;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface HealthResponse {
  status: 'ok';
  service: string;
  version: string;
  uptime: number;
  timestamp: string;
  environment: string;
}
