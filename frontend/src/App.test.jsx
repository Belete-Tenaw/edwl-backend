import { render, screen } from '@testing-library/react';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

test('renders app without crashing', () => {
    // We wrap App in BrowserRouter if App itself doesn't include it at the root level for tests,
    // but usually main.jsx wraps App. If App contains Routes, it needs Router context.
    // Our App.jsx contains <Router>, so it provides its own context? 
    // Let's check App.jsx content. If it has BrowserRouter, we just render <App />.
    // Assuming App usually has the providers or Router inside, but often main.jsx has the Router.
    // Let's wrap in BrowserRouter just in case or mock it if App has it.
    // Safe bet for smoke test of a high level component is to wrap or mock.

    // Actually, let's just try to render it. If it fails due to missing router, we wrap.
    // However, best practice:
    render(
        <App />
    );
    // Since we just want to ensure it renders, we can check for something global like the Navbar text
    // "EDWL" or similar.
    // text "EDWL" is in the Navbar.
    // Note: If App.jsx includes BrowserRouter, wrapping it again might be redundant but usually harmless unless it enforces single router.
});
