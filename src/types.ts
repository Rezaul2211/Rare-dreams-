export interface Product {
  id: string;
  name: string;
  category: 'Men' | 'Women' | 'Kids';
  subcategory?: string;
  price: number;
  comparePrice?: number;
  discount?: number;
  stockQuantity: number;
  sizeOptions?: string[];
  colorOptions?: string[];
  material?: string;
  description: string;
  images: string[];
  status: 'published' | 'draft';
  sku?: string;
  createdAt: any;
  updatedAt?: any;
}

export interface CartItem extends Product {
  cartItemId: string;
  selectedSize?: string;
  selectedColor?: string;
  quantity: number;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'customer' | 'admin';
  createdAt: any;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  products: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: 'stripe' | 'bKash' | 'nagad' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  stripeSessionId?: string;
  createdAt: any;
}
