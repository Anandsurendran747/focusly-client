import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Auth from './pages/Auth';
import Todos from './pages/Todos';
import Books from './pages/Books';
import Lessons from './pages/Lessons';
import './App.css';
import Navbar from './components/Navbar';
import { BrowserRouter, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import PrivateRoute from './routes/PrivateRoute';
import Schedules from './pages/Schedules';
import { getFCMToken } from './getToken';


export function useInstallPrompt() {
  const [prompt, setPrompt] = useState(null);

  useEffect(() => {
    // Check if it already fired before component mounted
    if (window.__installPrompt) {
      console.log("✅ Found early-captured prompt");
      setPrompt(window.__installPrompt);
      return;
    }

    // Otherwise wait for it
    const handler = (e) => {
      e.preventDefault();
      window.__installPrompt = e;
      setPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    console.log("User choice:", outcome);
    if (outcome === "accepted") {
      window.__installPrompt = null;
      setPrompt(null);
    }
  };

  return { canInstall: !!prompt, install };
}

const NAV_ITEMS = [
  { id: 'todos', label: 'Tasks', icon: '✓' },
  { id: 'books', label: 'Books', icon: '◉' },
  { id: 'lessons', label: 'Lessons', icon: '◈' },
  { id: 'schedule', label: 'Schedule', icon: '📅' },
];

function MainApp() {
  const { user, logout, page, setPage } = useApp();
  const navigate = useNavigate();
  useEffect(() => {

    getFCMToken()
      .then((token) => {
        // Send token to backend
      });

  }, []);

  return (
    <div className="app">
      <Navbar />
      <main className="app-main">
        <div className="page-content animate-in" key={page}>
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="mobile-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`mobile-nav-btn ${page === item.id ? 'active' : ''}`}
            onClick={() => {
              setPage(item.id);
              navigate(`/${item.id}`);
            }}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<PrivateRoute><MainApp /></PrivateRoute>} >
            <Route index path="" element={<PrivateRoute><Todos /></PrivateRoute>} />
            <Route path="/todos" element={<PrivateRoute><Todos /></PrivateRoute>} />
            <Route path="/books" element={<PrivateRoute><Books /></PrivateRoute>} />
            <Route path="/lessons" element={<PrivateRoute><Lessons /></PrivateRoute>} />
            <Route path="/schedule" element={<PrivateRoute><Schedules /></PrivateRoute>} />
          </Route>
          {/* <Route path="/unauthorized" element={<Unauthorized />} /> */}
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
