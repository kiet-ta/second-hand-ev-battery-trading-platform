// src/components/SSEListener.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import NotificationToast from './NotificationToast';

const SSEListener = ({ userId, onNewNotification }) => {
  const [toasts, setToasts] = useState([]);
const sseEndpoint = `https://localhost:7272/api/Notifications/register?userId=${userId}`;
  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(n => n.id !== id));
  }, []);

  useEffect(() => {
    if (!window.EventSource || !userId) {
      console.warn("SSE not supported or userId is missing.");
      return;
    }

    const eventSource = new EventSource(sseEndpoint);

    eventSource.onmessage = (event) => {
      try {
        // The C# backend sends the message content as plain string "data: {message}\n\n".
        // Here we assume the message is a JSON string of a notification object.
        const parsedData = JSON.parse(event.data); 
        
        // Ensure the notification object has required fields (id, content, type)
        const newNotification = {
          id: Date.now(), 
          ...parsedData,
          isUnread: true, // Mark as unread for the main dropdown
        };

        // 1. Show the real-time toast
        setToasts(prev => [newNotification, ...prev]);
        setTimeout(() => dismissToast(newNotification.id), 7000);

        // 2. Pass the notification up to be added to the main list
        onNewNotification(newNotification);
        
      } catch (e) {
        console.error('Failed to parse SSE message:', event.data, e);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error. Connection will attempt to reconnect.', error);
    };

    return () => {
      eventSource.close();
      console.log('SSE connection closed.');
    };
  }, [sseEndpoint, userId, dismissToast, onNewNotification]);

  // Render toasts in a portal
  return createPortal(
    <div className="fixed top-4 right-4 z-[100] space-y-3">
      {toasts.map(toast => (
        <NotificationToast 
          key={toast.id} 
          notification={toast}
          onClose={() => dismissToast(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
};

export default SSEListener;