import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  const getIcon = (type) => {
    const icons = { appointment: '📅', message: '💬', payment: '💳', scan: '📸', review: '⭐', reminder: '⏰', system: '🔔' };
    return icons[type] || '🔔';
  };

  const showToast = (notification) => {
    if (!notification?.title) return;
    toast(`${getIcon(notification.type)} ${notification.title}: ${notification.message}`, {
      position: 'top-right',
      autoClose: 6000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        background: 'white',
        borderRadius: '14px',
        borderLeft: '4px solid #00897B',
        boxShadow: '0 10px 30px rgba(0, 137, 123, 0.18)',
      },
      progressStyle: { background: 'linear-gradient(90deg, #00695C, #4DB6AC)' },
    });
  };

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:4000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    setSocket(newSocket);

    // Get user data
    const doctorData = localStorage.getItem('doctor');
    const patientData = localStorage.getItem('patient');
    const adminData = localStorage.getItem('admin');

    let userData = null;
    let userType = null;

    if (doctorData) {
      userData = JSON.parse(doctorData);
      userType = 'Doctor';
    } else if (patientData) {
      userData = JSON.parse(patientData);
      userType = 'Patient';
    } else if (adminData) {
      userData = JSON.parse(adminData);
      userType = 'Admin';
    }

    if (userData && userData._id) {
      // Connection event
      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
        setConnected(true);
        
        // Join user's room
        newSocket.emit('join', { userId: userData._id, userType });
      });

      // Listen for notifications
      newSocket.on('notification', (notification) => {
        console.log('🔔 New notification received:', notification);
        
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        showToast(notification);
      });

      // Disconnect event
      newSocket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        setConnected(false);
      });

      // Fetch existing notifications
      fetchNotifications(userData._id, userType);
    }

    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, []);

  const fetchNotifications = async (userId, userType) => {
    try {
      const response = await fetch(`http://localhost:4000/api/notifications/${userType}/${userId}`);
      const data = await response.json();
      
      const notifs = data.notifications || [];
      setNotifications(notifs);
      setUnreadCount(data.unreadCount || 0);

      // Show toast for latest unread notification on load
      const latestUnread = notifs.find(n => !n.read);
      if (latestUnread && latestUnread.title && latestUnread.message) {
        setTimeout(() => showToast(latestUnread), 1500);
      } else if (notifs.length === 0) {
        // Demo toast so UI is visible — remove in production
        setTimeout(() => showToast({
          type: 'system',
          title: 'Welcome to DentalCare+',
          message: 'You have no new notifications right now.',
        }), 1500);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`http://localhost:4000/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true, readAt: new Date() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const doctorData = localStorage.getItem('doctor');
    const patientData = localStorage.getItem('patient');
    const adminData = localStorage.getItem('admin');

    let userData = null;
    let userType = null;

    if (doctorData) {
      userData = JSON.parse(doctorData);
      userType = 'Doctor';
    } else if (patientData) {
      userData = JSON.parse(patientData);
      userType = 'Patient';
    } else if (adminData) {
      userData = JSON.parse(adminData);
      userType = 'Admin';
    }

    if (!userData) return;

    try {
      await fetch('http://localhost:4000/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData._id, userType })
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await fetch(`http://localhost:4000/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n._id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const deleteAllNotifications = async () => {
    const doctorData = localStorage.getItem('doctor');
    const patientData = localStorage.getItem('patient');
    const adminData = localStorage.getItem('admin');

    let userData = null;
    let userType = null;

    if (doctorData) {
      userData = JSON.parse(doctorData);
      userType = 'Doctor';
    } else if (patientData) {
      userData = JSON.parse(patientData);
      userType = 'Patient';
    } else if (adminData) {
      userData = JSON.parse(adminData);
      userType = 'Admin';
    }

    if (!userData) return;

    try {
      await fetch('http://localhost:4000/api/notifications/delete-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData._id, userType })
      });
      
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      connected,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      deleteAllNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
