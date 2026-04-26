import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can log the error to an analytics service here
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '50px', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
                    <div style={{ background: '#fee2e2', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    </div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Something went wrong</h1>
                    <p style={{ color: '#666', marginBottom: '30px', maxWidth: '400px' }}>We've encountered an unexpected error. Don't worry, our team has been notified. Please try refreshing the page.</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="btn-primary"
                        style={{ padding: '12px 30px', borderRadius: '8px' }}
                    >
                        Refresh Page
                    </button>
                    <a href="/" style={{ marginTop: '20px', color: '#666', textDecoration: 'underline', fontSize: '0.9rem' }}>Go to Homepage</a>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
