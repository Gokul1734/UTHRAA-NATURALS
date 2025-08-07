import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config/environment';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    // Extract the base URL from API_BASE_URL (remove /api)
    const baseURL = API_BASE_URL.replace('/api', '');
    
    this.socket = io(baseURL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket.IO connected:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket.IO disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket.IO connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // Join order tracking room
  joinOrderTracking(orderId) {
    if (!this.socket || !this.isConnected) {
      this.connect();
    }
    
    this.socket.emit('join-order-tracking', orderId);
    console.log(`👥 Joined order tracking room: order-${orderId}`);
  }

  // Leave order tracking room
  leaveOrderTracking(orderId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-order-tracking', orderId);
      console.log(`👋 Left order tracking room: order-${orderId}`);
    }
  }

  // Listen for order status updates
  onOrderStatusUpdate(callback) {
    if (!this.socket) {
      this.connect();
    }

    const eventName = 'order-status-updated';
    this.socket.on(eventName, callback);
    
    // Store the listener for cleanup
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
    
    console.log('👂 Listening for order status updates');
  }

  // Remove order status update listener
  offOrderStatusUpdate(callback) {
    if (this.socket) {
      this.socket.off('order-status-updated', callback);
      
      // Remove from listeners map
      const eventName = 'order-status-updated';
      if (this.listeners.has(eventName)) {
        const listeners = this.listeners.get(eventName);
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }
  }

  // Admin: Emit status update (for testing purposes)
  emitAdminStatusUpdate(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('admin-status-update', data);
      console.log('📦 Emitted admin status update:', data);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }

  // Get socket instance
  getSocket() {
    if (!this.socket || !this.isConnected) {
      this.connect();
    }
    return this.socket;
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService; 