import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000'; // Default to backend URL

let socket;

try {
    socket = io(SOCKET_URL, {
        autoConnect: false,
        reconnection: true,
    });
} catch (error) {
    console.error('Socket initialization failed:', error);
}

export default socket;
