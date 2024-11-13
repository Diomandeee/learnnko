import { Order } from '@/types/pos';

export const orderService = {
  async getOrders(): Promise<Order[]> {
    try {
      const response = await fetch('/api/pos/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const orders = await response.json();
      
      // Update localStorage
      localStorage.setItem('orders', JSON.stringify(orders));
      
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to localStorage
      const savedOrders = localStorage.getItem('orders');
      return savedOrders ? JSON.parse(savedOrders) : [];
    }
  },

  async createOrder(orderData: Omit<Order, 'id'>): Promise<Order> {
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
      
      // Update localStorage
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = [order, ...existingOrders];
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      // Fallback to localStorage only
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const newOrder = { ...orderData, id: Date.now().toString() };
      const updatedOrders = [newOrder, ...existingOrders];
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      return newOrder as Order;
    }
  },

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
    try {
      const response = await fetch(`/api/pos/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update order');
      
      const updatedOrder = await response.json();
      
      // Update localStorage
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = existingOrders.map((order: Order) =>
        order.id === orderId ? updatedOrder : order
      );
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order:', error);
      // Fallback to localStorage only
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = existingOrders.map((order: Order) =>
        order.id === orderId ? { ...order, ...updates } : order
      );
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      return updatedOrders.find((order: Order) => order.id === orderId) as Order;
    }
  },

  async deleteOrder(orderId: string): Promise<void> {
    try {
      const response = await fetch(`/api/pos/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete order');
      
      // Update localStorage
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = existingOrders.filter((order: Order) => order.id !== orderId);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
    } catch (error) {
      console.error('Error deleting order:', error);
      // Fallback to localStorage only
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = existingOrders.filter((order: Order) => order.id !== orderId);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
    }
  },

  async clearAllOrders(): Promise<void> {
    try {
      const existingOrders = await this.getOrders();
      await Promise.all(
        existingOrders.map(order => this.updateOrder(order.id, { status: 'CANCELLED' }))
      );
      localStorage.setItem('orders', JSON.stringify([]));
    } catch (error) {
      console.error('Error clearing orders:', error);
      localStorage.setItem('orders', JSON.stringify([]));
    }
  },
 
  async exportOrders(): Promise<string> {
    try {
      const orders = await this.getOrders();
      const data = {
        orders,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting orders:', error);
      // Fallback to localStorage
      const savedOrders = localStorage.getItem('orders');
      return savedOrders || '[]';
    }
  },
 
  async importOrders(data: string): Promise<void> {
    try {
      const parsedData = JSON.parse(data);
      if (Array.isArray(parsedData.orders)) {
        await Promise.all(
          parsedData.orders.map((order: Order) => this.createOrder(order))
        );
      }
    } catch (error) {
      console.error('Error importing orders:', error);
      throw new Error('Invalid import data format');
    }
  },

  async updateLeadInterest(orderId: string, interested: boolean): Promise<Order> {
    return this.updateOrder(orderId, { interested });
  },
 
  async updateOrderStatus(orderId: string, status: string, preparationTime?: number): Promise<Order> {
    return this.updateOrder(orderId, {
      status,
      preparationTime,
      ...(status === 'IN_PROGRESS' && { startTime: new Date() })
    });
  },
 
  async updateOrderNotes(orderId: string, notes: string): Promise<Order> {
    return this.updateOrder(orderId, { notes });
  },

  async resetAllData(): Promise<void> {
    try {
      localStorage.setItem('orders', JSON.stringify([]));
    } catch (error) {
      console.error('Error resetting data:', error);
      localStorage.setItem('orders', JSON.stringify([]));
    }
  }
 
 };