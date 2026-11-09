import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { authService } from '../services/AuthService';
import './AuthForm.css';

export const ForgotPassword: React.FC = () => {
    const [email, setEmail] = React.useState('');
    const [message, setMessage] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setMessage(null);
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
                <p>הזן את כתובת האימייל שלך. אם היא רשומה במערכת, נשלח אליה קישור לאיפוס.</p>
                <div className="form-group">
                    <label htmlFor="reset-email">כתובת אימייל</label>
                    <input
                        id="reset-email"
                        type="email"
                        dir="ltr"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={event => setEmail(event.target.value)}
                    />
                </div>
                {error && <p className="error" role="alert">{error}</p>}
                {message && <p className="success" role="status">{message}</p>}
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'שולח...' : 'שלח קישור לאיפוס'}
                </button>
                <p className="auth-switch"><Link to="/login">חזרה להתחברות</Link></p>
            </form>
        </div>
    );
};
