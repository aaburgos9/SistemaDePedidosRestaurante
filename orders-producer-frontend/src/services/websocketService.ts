type WebSocketCallback = (data: any) => void;

// Get WebSocket URL from environment variables
const getWebSocketUrl = (): string => {
  const nodeServiceUrl = import.meta.env.VITE_NODE_MS_URL;
  if (nodeServiceUrl) {
    // Convert HTTP(S) URL to WebSocket URL
    return nodeServiceUrl.replace(/^https?/, nodeServiceUrl.startsWith('https') ? 'wss' : 'ws');
  }
  // Fallback to localhost for development
  return 'ws://localhost:4000';
};

class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Set<WebSocketCallback> = new Set();
  private reconnectInterval: number = 5000;
  private reconnectTimer: number | null = null;
  private url: string;

  constructor(url?: string) {
    this.url = url || getWebSocketUrl();
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected. Attempting to reconnect...');
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      console.log('🔄 Reconnecting WebSocket...');
      this.connect();
    }, this.reconnectInterval);
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.listeners.clear();
  }

  subscribe(callback: WebSocketCallback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(data: any) {
    this.listeners.forEach(callback => callback(data));
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const websocketService = new WebSocketService();