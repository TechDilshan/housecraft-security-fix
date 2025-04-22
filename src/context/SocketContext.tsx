
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
    
    // Cleanup function to disconnect socket
    const disconnectSocket = () => {
      if (socket) {
        console.log('Manually disconnecting socket');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    };

    if (user && !socket) {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found for socket connection');
        return disconnectSocket;
      }
      
      // Connect to socket server with authentication
      const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
      console.log(`Connecting to socket server at: ${socketUrl}`);
      
      const socketInstance = io(socketUrl, {
        auth: { token },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });
      
      // Set up event listeners
      socketInstance.on('connect', () => {
        console.log('Socket connected with ID:', socketInstance.id);
        setIsConnected(true);
      });
      
      socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected. Reason:', reason);
        setIsConnected(false);
      });
      
      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
      });
      
      socketInstance.on('error', (error) => {
        console.error('Socket error:', error);
      });
      
      setSocket(socketInstance);
      
      // Clean up on unmount
      return disconnectSocket;
    } else if (!user && socket) {
      // Disconnect if user logs out
      return disconnectSocket;
    }
    
    return disconnectSocket;
  }, [user, loading]);
  
  // Join a chat room
  const joinChat = (consultationId: string) => {
    if (socket && isConnected) {
      console.log(`Joining chat room: ${consultationId}`);
      socket.emit('join-chat', consultationId);
    } else {
      console.warn('Cannot join chat - socket not connected');
    }
  };
  
  // Leave a chat room
  const leaveChat = (consultationId: string) => {
    if (socket && isConnected) {
      console.log(`Leaving chat room: ${consultationId}`);
      socket.emit('leave-chat', consultationId);
    }
  };
  
  // Send a message
  const sendMessage = (consultationId: string, recipientId: string, content: string) => {
    if (socket && isConnected) {
      console.log(`Sending message to ${recipientId} in consultation ${consultationId}`);
      socket.emit('send-message', { consultationId, recipientId, content });
    } else {
      console.warn('Cannot send message - socket not connected');
    }
  };
  
  return (
    <SocketContext.Provider value={{ socket, isConnected, joinChat, leaveChat, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};
