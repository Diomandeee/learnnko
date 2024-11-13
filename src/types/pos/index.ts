export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  popular: boolean;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
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
  notes?: string;
  status: string;
  total: number;
  interested?: boolean;
  isComplimentary: boolean;
  queueTime?: number;
  startTime: Date;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
  preparationTime?: number;
}

export interface QuickNote {
  id: string;
  content: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}


