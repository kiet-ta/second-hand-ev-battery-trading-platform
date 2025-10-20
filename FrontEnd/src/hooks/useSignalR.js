import { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

const useSignalR = (hubUrl) => {
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef(null);

  useEffect(() => {
    // Function to get the current token (assuming a function or localStorage)
    const getAccessToken = () => {
      return localStorage.getItem('token');
    };

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: getAccessToken, // Uses the current token
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    newConnection.onreconnecting(() => setIsConnected(false));
    newConnection.onreconnected(() => setIsConnected(true));
    newConnection.onclose(() => setIsConnected(false));

    newConnection.start()
      .then(() => {
        console.log('SignalR connected to:', hubUrl);
        setConnection(newConnection);
        connectionRef.current = newConnection;
        setIsConnected(true);
      })
      .catch((err) => console.error('SignalR connection error:', err));

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, [hubUrl]);

  return { connection, isConnected };
};

export default useSignalR;