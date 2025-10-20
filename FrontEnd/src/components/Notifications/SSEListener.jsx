// src/components/SSEListener.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import NotificationToast from './NotificationToast';

const SSEListener = ({ userId, onNewNotification }) => {
    const [toasts, setToasts] = useState([]);
    const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;
    
    const sseEndpoint = `${baseURL}api/Notifications/register?userId=${userId}`; 

    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(n => n.id !== id));
    }, []);

    useEffect(() => {
        if (!window.EventSource) {
            console.error("Browser does not support Server-Sent Events.");
            return;
        }
        if (!userId || userId.length === 0) {
            console.warn("SSE Listener waiting for valid userId...");
            return;
        }

        console.log(`Attempting to connect SSE for user: ${userId} via proxy...`);
        
        const eventSource = new EventSource(sseEndpoint);

        eventSource.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data); 
                console.log("[SSE DEBUG] Message Received!");
            console.log("[SSE DEBUG] Raw Event Data:", event.data);
                const category = payload.notiType ? payload.notiType.toLowerCase() : 'activities';
                
                const newNotification = {
                    id: Date.now(), 
                    ...payload,
                    category: category, 
                    isUnread: true, 
                };

                setToasts(prev => [newNotification, ...prev]);
                setTimeout(() => dismissToast(newNotification.id), 7000);

                onNewNotification(newNotification);
                
            } catch (e) {
                console.error('Failed to parse SSE message:', event.data, e);
            }
        };
        
        eventSource.onopen = () => {
             console.log('SSE connection successfully opened.');
        };


        eventSource.onerror = (error) => {
             console.error('SSE Error. Connection will attempt to reconnect.', error);
        };

        return () => {
            eventSource.close();
            console.log('SSE connection closed or re-initiated.');
        };
        
    }, [userId, sseEndpoint, dismissToast, onNewNotification]);

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