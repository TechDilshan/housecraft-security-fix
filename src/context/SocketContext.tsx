
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinChat: (consultationId: string) => void;
  leaveChat: (consultationId: string) => void;
  sendMessage: (consultationId: string, recipientId: string, content: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinChat: () => {},
  leaveChat: () => {},
  sendMessage: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const disconnectSocket = () => {
      if (socket) {
        console.log('Disconnecting socket');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    };

    if (user && !socket) {
      const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
      console.log('Connecting to socket server:', socketUrl);

      const socketInstance = io(socketUrl, {
        // Token is now handled automatically via httpOnly cookies
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected successfully', socketInstance.id);
        setIsConnected(true);
        toast.success('Connected to chat server');
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
        toast.error('Disconnected from chat server');
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        toast.error('Chat connection error: ' + error.message);
      });

      socketInstance.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error('Chat error: ' + error.message);
      });

      socketInstance.on('new-message', (message) => {
        console.log('New message received:', message);
        // The actual message handling is done in the ChatInterface component
      });

      setSocket(socketInstance);

      return disconnectSocket;
    } else if (!user && socket) {
      return disconnectSocket;
    }

    return disconnectSocket;
  }, [user, loading]);

  const joinChat = (consultationId: string) => {
    if (socket && isConnected) {
      console.log('Joining chat room:', consultationId);
      socket.emit('join-chat', consultationId);
      toast.success('Joined chat room');
    } else {
      console.warn('Cannot join chat - socket not connected');
      toast.error('Cannot join chat - not connected');
    }
  };

  const leaveChat = (consultationId: string) => {
    if (socket && isConnected) {
      console.log('Leaving chat room:', consultationId);
      socket.emit('leave-chat', consultationId);
    }
  };

  const sendMessage = (consultationId: string, recipientId: string, content: string) => {
    if (socket && isConnected) {
      console.log('Sending message:', { consultationId, recipientId, content });
      socket.emit('send-message', { consultationId, recipientId, content });
    } else {
      console.warn('Cannot send message - socket not connected');
      toast.error('Cannot send message - not connected');
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinChat, leaveChat, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};
