import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import NotificationToast from './NotificationToast';

const SSEListener = ({ userId, onNewNotification }) => {
  const [toasts, setToasts] = useState([]);
  const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;
  const sseEndpoint = `${baseURL}api/Notifications/register?userId=${userId}`;

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    if (!window.EventSource) {
      console.error('Browser does not support Server-Sent Events.');
      return;
    }
    if (!userId || userId.length === 0) {
      console.warn('SSE Listener waiting for valid userId...');
      return;
    }

    console.log(`Attempting to connect SSE for user: ${userId}`);

    const eventSource = new EventSource(sseEndpoint);

    eventSource.onopen = () => {
      console.log('✅ SSE connection successfully opened.');
    };

    eventSource.onerror = (error) => {
      console.error('❌ SSE Error. Connection will attempt to reconnect.', error);
    };

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log('[SSE DEBUG] Message received:', payload);

        if (String(payload.senderId) === String(userId)) {
          console.log('[SSE DEBUG] Ignoring self-notification:', payload);
          return;
        }

        const category = payload.notiType
          ? payload.notiType.toLowerCase()
          : 'activities';

        const newNotification = {
          id: Date.now(),
          ...payload,
          category,
          isUnread: true,
        };

        // Show toast notification
        setToasts((prev) => [newNotification, ...prev]);

        // Auto-dismiss after 7s
        setTimeout(() => dismissToast(newNotification.id), 7000);

        // Pass it up to parent handler if needed
        onNewNotification(newNotification);
      } catch (e) {
        console.error('❌ Failed to parse SSE message:', event.data, e);
      }
    };

    return () => {
      eventSource.close();
      console.log('🔌 SSE connection closed.');
    };
  }, [userId, sseEndpoint, dismissToast, onNewNotification]);

  // Create a portal for toast notifications
  return createPortal(
    <div className="fixed top-4 right-4 z-[100] space-y-3">
      {toasts.map((toast) => (
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
