
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

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
  
  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (loading) return;
    
    if (user && !socket) {
      const token = localStorage.getItem('token');
      
      // Connect to socket server with authentication
      const socketInstance = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001', {
        auth: { token },
        autoConnect: true,
      });
      
      // Set up event listeners
      socketInstance.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });
      
      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });
      
      socketInstance.on('error', (error) => {
        console.error('Socket error:', error);
      });
      
      setSocket(socketInstance);
      
      // Clean up on unmount
      return () => {
        socketInstance.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    } else if (!user && socket) {
      // Disconnect if user logs out
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [user, loading]);
  
  // Join a chat room
  const joinChat = (consultationId: string) => {
    if (socket && isConnected) {
      socket.emit('join-chat', consultationId);
    }
  };
  
  // Leave a chat room
  const leaveChat = (consultationId: string) => {
    if (socket && isConnected) {
      socket.emit('leave-chat', consultationId);
    }
  };
  
  // Send a message
  const sendMessage = (consultationId: string, recipientId: string, content: string) => {
    if (socket && isConnected) {
      socket.emit('send-message', { consultationId, recipientId, content });
    }
  };
  
  return (
    <SocketContext.Provider value={{ socket, isConnected, joinChat, leaveChat, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};
