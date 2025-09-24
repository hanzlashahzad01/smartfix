import React, { useState, useEffect } from "react";
import { useRealTime } from "../context/RealTimeContext";
import { notificationsAPI } from '../utils/api';

export default function Notifications() {
  const { isConnected, notifications: realTimeNotifications, sendNotification } = useRealTime();
  const [notification, setNotification] = useState({
    title: "",
    message: "",
    recipient: "",
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deviceToken, setDeviceToken] = useState("");
  const [fcmToken, setFcmToken] = useState("");

  useEffect(() => {
    fetchNotifications();
    setupFCM();
  }, []);

  useEffect(() => {
    if (realTimeNotifications.length > 0) {
      setNotifications(prev => {
        const newNotifs = [...realTimeNotifications, ...prev];
        return newNotifs.slice(0, 20);
      });
    }
  }, [realTimeNotifications]);

  const setupFCM = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Browser notifications enabled');
      }
    } catch (error) {
      console.warn('FCM setup skipped:', error.message);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll();
      if (response.success) {
        setNotifications(response.data);
      } else {
        console.error('Failed to fetch notifications:', response.message);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleChange = (e) => {
    setNotification({ ...notification, [e.target.name]: e.target.value });
  };

  const handleSend = async () => {
    if (!notification.title.trim() || !notification.message.trim()) {
      alert('Please fill in both title and message fields');
      return;
    }

    try {
      setLoading(true);
      const response = await notificationsAPI.create({
        title: notification.title,
        message: notification.message,
        target: notification.recipient || 'all',
        type: 'info',
        category: 'system'
      });

      if (response.success) {
        setNotification({ title: "", message: "", recipient: "" });
        fetchNotifications(); // Refresh notifications list
        
        // Send via WebSocket for real-time updates
        if (sendNotification) {
          sendNotification({
            title: notification.title,
            message: notification.message,
            recipient: notification.recipient || 'all'
          });
        }
        
        alert('Notification sent successfully!');
      } else {
        alert('Failed to send notification. Please try again.');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendViaHTTP = async () => {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || 'demo'}`,
      },
      body: JSON.stringify({
        title: notification.title,
        message: notification.message,
        userId: notification.recipient,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      alert(`Notification sent successfully! ID: ${result.id}`);
    } else {
      throw new Error('Failed to send notification');
    }
  };

  const registerDeviceToken = async () => {
    if (!deviceToken.trim()) {
      alert('Please enter a device token');
      return;
    }

    try {
      const response = await fetch('/api/notifications/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo'}`,
        },
        body: JSON.stringify({
          userId: 'admin',
          token: deviceToken,
          platform: 'web'
        }),
      });

      if (response.ok) {
        alert('Device token registered successfully!');
        setDeviceToken("");
      } else {
        alert('Failed to register device token');
      }
    } catch (error) {
      console.error('Error registering device token:', error);
      alert('Error registering device token');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center">
          <span className="mr-3 text-2xl">🔔</span> Notification Management
        </h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-500">
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Send New Notification</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={notification.title}
              onChange={handleChange}
              required
              minLength="3"
              maxLength="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter notification title"
              title="Title must be between 3-100 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              name="message"
              value={notification.message}
              onChange={handleChange}
              required
              minLength="10"
              maxLength="500"
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter notification message"
              title="Message must be between 10-500 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient (User ID)</label>
            <input
              type="text"
              name="recipient"
              value={notification.recipient}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter user ID or leave empty for all users"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition duration-200 font-medium disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Notification'}
            </button>
            <span className="text-sm text-gray-500">
              {isConnected ? 'Will send via WebSocket + HTTP' : 'Will send via HTTP only'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Device Token Registration</h3>
        <div className="flex space-x-4">
          <input
            type="text"
            value={deviceToken}
            onChange={(e) => setDeviceToken(e.target.value)}
            placeholder="Enter device token for testing"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={registerDeviceToken}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition duration-200 font-medium"
          >
            Register Token
          </button>
        </div>
        {fcmToken && (
          <p className="text-xs text-gray-500 mt-2 break-all">FCM Token: {fcmToken}</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Recent Notifications</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Real-time:</span>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
        </div>
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No notifications yet</p>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">{notif.title}</h4>
                  <span className="text-sm text-gray-500">
                    {new Date(notif.timestamp || notif.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{notif.message}</p>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Recipient: {notif.recipient || 'All users'}
                  </p>
                  {notif.timestamp && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Live
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Connection Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">🌐</div>
            <div className="text-sm text-gray-600">WebSocket</div>
            <div className={`text-lg font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">📡</div>
            <div className="text-sm text-gray-600">HTTP API</div>
            <div className="text-lg font-bold text-blue-600">Available</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-2">🔔</div>
            <div className="text-sm text-gray-600">Live Updates</div>
            <div className={`text-lg font-bold ${isConnected ? 'text-green-600' : 'text-gray-600'}`}>
              {isConnected ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}