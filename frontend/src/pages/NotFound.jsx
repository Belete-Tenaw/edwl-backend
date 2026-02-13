import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div style={styles.container}>
            <h1 style={styles.header}>404</h1>
            <p style={styles.text}>Oops! The page you are looking for does not exist.</p>
            <Link to="/" style={styles.link}>Go Back Home</Link>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        color: '#333',
    },
    header: {
        fontSize: '6rem',
        margin: '0',
        color: '#dc3545',
    },
    text: {
        fontSize: '1.5rem',
        margin: '1rem 0',
    },
    link: {
        fontSize: '1.2rem',
        color: '#007bff',
        textDecoration: 'none',
        border: '1px solid #007bff',
        padding: '10px 20px',
        borderRadius: '5px',
        transition: 'background-color 0.3s',
    },
};

export default NotFound;
