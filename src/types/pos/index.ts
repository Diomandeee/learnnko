export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  popular: boolean;
}

export interface MilkOption {
  name: string;
  price: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
  flavor?: string;
  milk?: MilkOption;
}

export interface CustomerInfo {
  firstName: string;
  lastInitial: string;
  organization: string;
  email: string;
  phone: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  customerInfo: CustomerInfo;
  items: CartItem[];
  notes: string;
  timestamp: string;
  status: string;
  total: number;
  isComplimentary: boolean;
  queueTime: number;
  startTime: Date;
}

export interface QuickNote {
  id: string;
  content: string;
  createdAt: Date;
}
