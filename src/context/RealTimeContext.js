import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const RealTimeContext = createContext();

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};

export const RealTimeProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dashboardUpdates, setDashboardUpdates] = useState(null);

  useEffect(() => {
    // Initialize real socket connection to backend
    const newSocket = io('http://localhost:3002', {
      transports: ['websocket'],
      autoConnect: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      
      // Authenticate socket with JWT token
      const token = localStorage.getItem('token');
      if (token) {
        newSocket.emit('authenticate', token);
      }
      
      newSocket.emit('join-admin');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Listen for real-time notifications
    newSocket.on('notification-sent', (data) => {
      setNotifications(prev => [data, ...prev.slice(0, 9)]); // Keep last 10
    });

    // Listen for dashboard updates
    newSocket.on('dashboard-update', (data) => {
      setDashboardUpdates(data);
    });

    // Listen for job status updates
    newSocket.on('job-status', (data) => {
      console.log('Job status update:', data);
    });

    // Listen for dispute updates
    newSocket.on('dispute-update', (data) => {
      console.log('Dispute update:', data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendNotification = (notificationData) => {
    if (socket && isConnected) {
      socket.emit('send-notification', notificationData);
    }
  };

  const requestDashboardUpdate = () => {
    if (socket && isConnected) {
      socket.emit('request-dashboard-update');
    }
  };

  const value = {
    socket,
    isConnected,
    notifications,
    dashboardUpdates,
    sendNotification,
    requestDashboardUpdate,
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};
