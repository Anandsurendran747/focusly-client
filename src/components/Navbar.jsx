import React from 'react'
import { useApp } from '../context/AppContext';
import {useNavigate} from 'react-router-dom';

const NAV_ITEMS = [
    { id: 'todos', label: 'Tasks', icon: '✓' },
    { id: 'books', label: 'Books', icon: '◉' },
    { id: 'lessons', label: 'Lessons', icon: '◈' },
    { id: 'schedule', label: 'Schedule', icon: '📅' },
];


const Navbar = () => {
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
        </header>
    )
}

export default Navbar
