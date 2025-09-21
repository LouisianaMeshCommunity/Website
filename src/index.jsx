import React from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'sans-serif',
      textAlign: 'center',
      backgroundColor: '#f0f2f5',
      color: '#333'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>
        Louisiana Mesh Community
      </h1>
      <p style={{ fontSize: '1.5rem', color: '#666' }}>
        Coming soon &lt;3
      </p>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
