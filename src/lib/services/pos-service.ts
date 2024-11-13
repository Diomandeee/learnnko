import { MenuItem, Order, QuickNote } from '@/types/pos';

interface PreferenceStore {
  [key: string]: unknown;
}

class PosService {
  private preferences: PreferenceStore = {};

  // Menu Item Operations
  async getMenuItems(): Promise<MenuItem[]> {
    try {
      const response = await fetch('/api/pos/menu');
      if (!response.ok) throw new Error('Failed to fetch menu items');
      return await response.json();
    } catch (error) {
      console.error('Error fetching menu items:', error);
      // Fallback to localStorage
      const items = localStorage.getItem('menuItems');
      return items ? JSON.parse(items) : [];
    }
  }

  async createMenuItem(data: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> {
    try {
      const response = await fetch('/api/pos/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create menu item');
      return await response.json();
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  }

  async updateMenuItem(id: string, data: Partial<MenuItem>): Promise<MenuItem> {
    try {
      const response = await fetch(`/api/pos/menu/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update menu item');
      return await response.json();
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  }

  async deleteMenuItem(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/pos/menu/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete menu item');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  }

  // Order Operations
  async createOrder(orderData: Order): Promise<Order> {
    try {
      const response = await fetch('/api/pos/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error('Failed to create order');
      
      const order = await response.json();
      
      // Store in localStorage as backup
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = [order, ...existingOrders];
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      localStorage.setItem('lastOrderNumber', orderData.orderNumber.toString());
      
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      // Fallback to localStorage only
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = [orderData, ...existingOrders];
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      localStorage.setItem('lastOrderNumber', orderData.orderNumber.toString());
      return orderData;
    }
  }

  // Quick Note Operations
  async getQuickNotes(): Promise<QuickNote[]> {
    try {
      const response = await fetch('/api/pos/notes');
      if (!response.ok) throw new Error('Failed to fetch quick notes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching quick notes:', error);
      // Fallback to localStorage
      const notes = localStorage.getItem('quickNotes');
      return notes ? JSON.parse(notes) : [];
    }
  }

  async createQuickNote(content: string): Promise<QuickNote> {
    try {
      const response = await fetch('/api/pos/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error('Failed to create quick note');
      
      const note = await response.json();
      
      // Update localStorage
      const existingNotes = JSON.parse(localStorage.getItem('quickNotes') || '[]');
      const updatedNotes = [...existingNotes, note];
      localStorage.setItem('quickNotes', JSON.stringify(updatedNotes));
      
      return note;
    } catch (error) {
      console.error('Error creating quick note:', error);
      // Fallback to localStorage only
      const existingNotes = JSON.parse(localStorage.getItem('quickNotes') || '[]');
      const newNote: QuickNote = { content, id: Date.now().toString(), userId: '' };
      const updatedNotes = [...existingNotes, newNote];
      localStorage.setItem('quickNotes', JSON.stringify(updatedNotes));
      return newNote;
    }
  }

  // Preference Operations
  savePreference(key: string, value: unknown): void {
    this.preferences[key] = value;
    localStorage.setItem(key, JSON.stringify(value));
  }

  getPreference<T>(key: string, defaultValue: T | null = null): T | null {
    if (this.preferences[key] === undefined) {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        this.preferences[key] = JSON.parse(stored);
      } else {
        this.preferences[key] = defaultValue;
      }
    }
    return this.preferences[key] as T | null;
  }

  getAllPreferences(): PreferenceStore {
    return this.preferences;
  }
}

export const posService = new PosService();
