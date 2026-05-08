import React, { useState, useEffect } from 'react';
import { useSocket } from '../hook/useSocket';

// URL del backend (ajustar según sea necesario)
const BACKEND_URL = 'http://localhost:3000';

const RealTimeDashboard = () => {
    const { isConnected, listen } = useSocket(BACKEND_URL);
    const [lecturas, setLecturas] = useState([]);

    useEffect(() => {
        // Escuchar el evento 'dato-nuevo' emitido por el backend
        const cleanup = listen('dato-nuevo', (nuevoDato) => {
            console.log('Nuevo dato recibido:', nuevoDato);
            
            // Actualizar el estado con el nuevo dato (manteniendo los últimos 10)
            setLecturas(prev => [nuevoDato, ...prev].slice(0, 10));
        });

        return cleanup; // Remover listener al desmontar
    }, [listen]);

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h2 style={styles.title}>Panel en Tiempo Real</h2>
                <div style={styles.statusContainer}>
                    <span 
                        style={{
                            ...styles.statusDot, 
                            backgroundColor: isConnected ? '#4caf50' : '#f44336' 
                        }} 
                    />
                    <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
                </div>
            </header>

            <div style={styles.tableContainer}>
                {lecturas.length === 0 ? (
                    <p style={styles.emptyMsg}>Esperando datos del ESP32...</p>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th>UUID Dispositivo</th>
                                <th>Valor</th>
                                <th>Fecha/Hora</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lecturas.map((dato, index) => (
                                <tr key={dato._id || index} style={styles.tableRow}>
                                    <td>{dato.dispositivo_uuid}</td>
                                    <td style={styles.valor}>{dato.valor}</td>
                                    <td style={styles.fecha}>
                                        {new Date(dato.fecha_insercion || Date.now()).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '900px',
        margin: '0 auto',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid #eee',
        paddingBottom: '10px',
        marginBottom: '20px'
    },
    title: {
        margin: 0,
        color: '#333'
    },
    statusContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: 'bold'
    },
    statusDot: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        display: 'inline-block'
    },
    tableContainer: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        overflow: 'hidden'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left'
    },
    tableHeader: {
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #ddd'
    },
    tableRow: {
        borderBottom: '1px solid #eee',
        animation: 'fadeIn 0.5s ease-in'
    },
    emptyMsg: {
        textAlign: 'center',
        padding: '40px',
        color: '#888',
        fontStyle: 'italic'
    },
    valor: {
        fontWeight: 'bold',
        color: '#2196f3'
    },
    fecha: {
        color: '#666',
        fontSize: '13px'
    }
};

export default RealTimeDashboard;
