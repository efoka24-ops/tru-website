import React from 'react';

export default function ErrorBoundary({ children }) {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const handleError = (event) => {
      setHasError(true);
      setError(event.message || 'Une erreur est survenue');
      console.error('Error caught:', event);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          maxWidth: '600px',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#ef4444', marginBottom: '16px' }}>❌ Erreur</h1>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Rafraîchir la page
          </button>
        </div>
      </div>
    );
  }

  return children;
}
