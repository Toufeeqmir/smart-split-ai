// Custom hook: subscribe to a socket event
import { useEffect } from 'react';
import socket from '../features/chat/socket';
export function useSocket(event, handler) {
  useEffect(() => {
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, [event, handler]);
}
