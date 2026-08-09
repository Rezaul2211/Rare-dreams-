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

export interface AddressItem {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface PaymentMethodItem {
  id: string;
  type: 'bKash' | 'Nagad' | 'Card' | 'Bank';
  accountNumber: string;
  accountName: string;
  isDefault?: boolean;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  role: 'customer' | 'admin';
  addresses?: AddressItem[];
  paymentMethods?: PaymentMethodItem[];
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
  paymentMethod: 'bKash' | 'nagad' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed';
  senderNumber?: string;
  transactionId?: string;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: any;
}
