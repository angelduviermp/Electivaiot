import React from 'react';
import RealTimeDashboard from './view/RealTimeDashboard';

function App() {
    return (
        <div className="App">
            <header style={styles.header}>
                <h1>Monitor de Sensores Esp32</h1>
            </header>
            <main>
                <RealTimeDashboard />
            </main>
        </div>
    );
}

const styles = {
    header: {
        backgroundColor: '#282c34',
        padding: '20px',
        color: 'white',
        textAlign: 'center',
        marginBottom: '30px'
    }
};

export default App;
