import { useEffect, useState } from 'react';
import { websocketService } from '../services/websocketService';

export function useWebSocket() {
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    websocketService.connect();

    const unsubscribe = websocketService.subscribe((data) => {
      setLastMessage(data);
    });

    // Check connection status periodically
    const checkConnection = setInterval(() => {
      setIsConnected(websocketService.isConnected());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(checkConnection);
    };
  }, []);

  return { lastMessage, isConnected };
}