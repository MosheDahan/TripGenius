import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export const Header: React.FC = () => {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header-logo">
                <Link to="/">🌍 TripGenius</Link>
            </div>
            <nav className="header-nav">
                <Link to="/about" className="nav-link">אודות</Link>
                {user ? (
                    <>
                        <Link to="/" className="nav-link">חופשות</Link>
                        <Link to="/recommendations" className="nav-link">המלצות AI</Link>
                        <Link to="/mcp" className="nav-link">שאלו את המאגר</Link>
                        {isAdmin && (
                            <>
                                <Link to="/add-vacation" className="nav-link">הוספת חופשה</Link>
                                <Link to="/reports" className="nav-link">דוחות</Link>
                            </>
                        )}
                        <span className="user-greeting">
                            שלום, <strong>{user.firstName} {user.lastName}</strong> ({user.role === 'Admin' ? 'מנהל' : 'משתמש'})
                        </span>
                        <button onClick={handleLogout} className="logout-btn">התנתקות</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">התחברות</Link>
                        <Link to="/register" className="nav-link highlight">הרשמה</Link>
                    </>
                )}
            </nav>
        </header>
    );
};