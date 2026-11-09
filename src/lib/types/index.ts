export interface Review {
  review_id:     string;
  product_id:    string;
  customer_name: string;
  rating:        number;
  title:         string;
  body:          string;
  created_at:    string;
}

export interface Product {
  product_id:         string;
  category_id?:       string | null;
  category_no?:       number;
  sku:                string;
  product_name:       string;
  slug:               string;
  description?:       string | null;
  image_url?:         string | null;
  base_price:         number;
  originalPrice?:     number | null;
  default_variant_id?: string | null;  // ← add
  stock:              'in' | 'low' | 'out';
  is_featured:        boolean;
  features:           string[];
  specs:              { k: string; v: string }[];
  reviewsN:           number;
}

export interface Category {
  category_id:   string;
  category_name: string;
  slug:          string;
  details:       string | null;
  status:        'A' | 'I' | 'D';
  parent_id:     string | null;
  parent_no:     number | null;
  category_no?:  number;
}

export interface Address {
  address_id:    string;
  label:         string;
  address_line1: string;
  address_line2: string | null;
  city:          string;
  state:         string;
  country:       string;
  postal_code:   string | null;
  is_default:    boolean;
  status:        string;
}

export interface Customer {
  customer_id: string;
  first_name:  string;
  last_name:   string;
  email_id:    string;
  mobile_no:   string | null;
  gender:      string | null;
  dob:         string | null;
  status:      string;
  created_at:  string;
  updated_at:  string;
}

export interface CartLine {
  id:         string;   // product_id UUID
  variant_id: string;   // variant_id UUID — unique key
  qty:        number;
  color:      string | null;
  size:       string | null;
  brand:      string;
  name:       string;
  sku:        string;
  price:      number;
  lineTotal:  string;
  variant:    string;
  image_url:  string | null;
}

export interface Order {
  order_id:     string;
  order_ref:    string;
  subtotal:     number;
  discount:     number;
  tax:          number;
  delivery_fee: number;
  total:        number;
  order_status: string;
  notes:        string | null;
  created_at:   string;
  updated_at:   string;
  items:        OrderItem[];
}

export interface OrderItem {
  order_item_id: string;
  variant_id?:   string;
  product_name:  string;
  sku:           string;
  attributes:    Record<string, string> | null;
  quantity:      number;
  unit_price:    number;
  total_price:   number;
  created_at:    string;
}

export interface DeliveryOption {
  key:   string;
  label: string;
  eta:   string;
  price: string;
}

export type PaymentMethod = 'card' | 'debit' | 'upi' | 'gpay' | 'applepay' | 'paypal' | 'cod';
export type StockStatus    = 'in' | 'low' | 'out';
export type BadgeType      = 'bestseller' | 'new' | 'deal' | null;

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data:    T;
}