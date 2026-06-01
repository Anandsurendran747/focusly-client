import React, { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { useInstallPrompt } from '../App';

const NAV_ITEMS = [
    { id: 'todos', label: 'Tasks', icon: '✓' },
    { id: 'books', label: 'Books', icon: '◉' },
    { id: 'lessons', label: 'Lessons', icon: '◈' },
    { id: 'schedule', label: 'Schedule', icon: '📅' },
];



const Navbar = () => {
    const [installPrompt, setInstallPrompt] = useState(null);

    useEffect(() => {
        // ✅ Check if already captured before component mounted
        if (window.__installPrompt) {
            console.log('Found pre-captured prompt');
            setInstallPrompt(window.__installPrompt);
            return;
        }

        // ✅ Otherwise listen for it
        const handler = (e) => {
            e.preventDefault();
            window.__installPrompt = e;
            setInstallPrompt(e);
            console.log('Install prompt available: true');
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!installPrompt) return;
        await installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        console.log('User choice:', outcome);
        if (outcome === 'accepted') {
            window.__installPrompt = null;
            setInstallPrompt(null);
        }
    };
    const navigate = useNavigate();
    const { user, logout, page, setPage } = useApp();
    const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return (
        <header className="app-header">
            <div className="header-brand">
                <span className="header-logo">◈</span>
                <span className="header-name">Focusly</span>
            </div>

            <nav className="header-nav">
                {NAV_ITEMS.map(item => (
                    <button
                        key={item.id}
                        className={`nav-btn ${page === item.id ? 'active' : ''}`}
                        onClick={() => {
                            setPage(item.id);
                            navigate(`/${item.id}`);
                        }}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="header-user">
                <div className="user-avatar" title={user.name}>{getInitials(user.name)}</div>
                <button className="logout-btn" onClick={logout} title="Sign out">↪</button>
            </div>
            {installPrompt && (
                <button
                    onClick={handleInstall}
                    className="install-btn"
                >
                    ⬇ Install
                </button>
            )}
        </header>
    )
}

export default Navbar
