import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import authService from '../services/authService';
import { API_BASE_URL } from '../services/api';
import { useToast } from '../components/Toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const addToast = useToast();
    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        if (currentUser) {
            const newSocket = io(API_BASE_URL, {
                transports: ['websocket'],
                upgrade: false
            });

            newSocket.on('connect', () => {
                console.log('[Socket] Connected');
                newSocket.emit('join', currentUser.id);
            });

            newSocket.on('notification', (data) => {
                console.log('[Socket] Notification received:', data);
                // Play sound or show toast
                addToast(data.message, data.type === 'error' ? 'error' : 'success');
                
                // Also trigger a custom event so specific pages can refresh their data
                window.dispatchEvent(new CustomEvent('edwl_notification', { detail: data }));
            });

            newSocket.on('disconnect', () => {
                console.log('[Socket] Disconnected');
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [currentUser?.id]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
