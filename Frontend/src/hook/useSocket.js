import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

/**
 * Hook personalizado para manejar la conexión WebSocket de Socket.io.
 * @param {string} serverUrl - URL del servidor backend.
 * @returns {object} - Contiene el estado de conexión y la instancia del socket.
 */
export const useSocket = (serverUrl) => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        // Inicializar la conexión
        const socket = io(serverUrl, {
            transports: ['websocket'],
            autoConnect: true,
            reconnectionAttempts: 5,
        });

        socketRef.current = socket;

        // Manejadores de eventos de conexión
        socket.on('connect', () => {
            console.log('Conectado al servidor WebSocket');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Desconectado del servidor WebSocket');
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('Error de conexión WebSocket:', error);
            setIsConnected(false);
        });

        // Limpiar la conexión al desmontar el componente
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [serverUrl]);

    /**
     * Función para escuchar eventos de forma segura.
     */
    const listen = useCallback((eventName, callback) => {
        if (!socketRef.current) return;
        
        socketRef.current.on(eventName, callback);

        // Retornar función para remover el listener (evita duplicados)
        return () => {
            socketRef.current.off(eventName, callback);
        };
    }, []);

    return {
        isConnected,
        socket: socketRef.current,
        listen
    };
};
