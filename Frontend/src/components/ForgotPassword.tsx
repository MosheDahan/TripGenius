import React from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { authService } from '../services/AuthService';
import './AuthForm.css';

export const ForgotPassword: React.FC = () => {
    const location = useLocation();
    const locationState = location.state;
    const initialEmail = typeof locationState === 'object'
        && locationState !== null
        && 'email' in locationState
        && typeof locationState.email === 'string'
        ? locationState.email.trim()
        : '';
    const email = initialEmail;
    const [message, setMessage] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setMessage(null);
        if (!email) {
            setError('חזור למסך ההתחברות והזן את כתובת האימייל שלך לפני בקשת איפוס.');
            return;
        }
        setIsSubmitting(true);
        try {
            setMessage(await authService.requestPasswordReset(email));
        } catch (requestError: unknown) {
            if (axios.isAxiosError<{ message?: string }>(requestError)) {
                setError(requestError.response?.data?.message || 'לא ניתן לשלוח קישור לאיפוס כרגע. נסה שוב מאוחר יותר.');
            } else {
                setError('לא ניתן לשלוח קישור לאיפוס כרגע. נסה שוב מאוחר יותר.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-card" onSubmit={onSubmit}>
                <h2>איפוס סיסמה</h2>
                <p>קישור חד־פעמי יישלח רק לכתובת שהזנת בשדה האימייל במסך ההתחברות.</p>
                <div className="form-group">
                    <label htmlFor="reset-email">כתובת אימייל</label>
                    <input
                        id="reset-email"
                        type="email"
                        dir="ltr"
                        autoComplete="email"
                        value={email}
                        readOnly
                    />
                </div>
                {!email && (
                    <p className="error" role="alert">
                        כדי לבקש איפוס, חזור למסך ההתחברות והזן תחילה את כתובת האימייל שלך.
                    </p>
                )}
                {error && <p className="error" role="alert">{error}</p>}
                {message && <p className="success" role="status">{message}</p>}
                <button type="submit" className="submit-btn" disabled={isSubmitting || !email}>
                    {isSubmitting ? 'בודק...' : 'שלח קישור לאיפוס'}
                </button>
                <p className="auth-switch"><Link to="/login">חזרה להתחברות</Link></p>
            </form>
        </div>
    );
};
