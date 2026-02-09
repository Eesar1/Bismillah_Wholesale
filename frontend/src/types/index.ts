export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'jewellery' | 'clothing';
  subcategory: string;
  image: string;
  images?: string[];
  inStock: boolean;
  stockQuantity: number;
  sku: string;
  tags: string[];
  rating?: number;
  reviews?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  zipCode: string;
}

export interface ShippingAddress {
  country: string;
  city: string;
  street: string;
  zipCode: string;
}

export interface Order {
  id: string;
  customer: CustomerInfo;
  shippingAddress: ShippingAddress;
  items: CartItem[];
  total: number;
  status:
    | 'pending'
    | 'awaiting_payment'
    | 'paid'
    | 'processing'
    | 'shipping'
    | 'shipped'
    | 'completed'
    | 'cancelled';
  createdAt: Date;
  notes?: string;
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

// Inventory management types
export interface InventoryUpdate {
  productId: string;
  newStock: number;
}
