import React from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../services/AuthService';
import './AuthForm.css';

export const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [message, setMessage] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setMessage(null);
        if (!token) {
            setError('קישור האיפוס חסר או לא תקין. בקש קישור חדש.');
            return;
        }
        if (password !== confirmPassword) {
            setError('הסיסמאות אינן תואמות.');
            return;
        }

        setIsSubmitting(true);
        try {
            setMessage(await authService.resetPassword(token, password));
        } catch (requestError: unknown) {
            if (axios.isAxiosError<{ message?: string }>(requestError)) {
                setError(requestError.response?.data?.message || 'איפוס הסיסמה נכשל. נסה שוב מאוחר יותר.');
            } else {
                setError('איפוס הסיסמה נכשל. נסה שוב מאוחר יותר.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-card" onSubmit={onSubmit}>
                <h2>בחירת סיסמה חדשה</h2>
                <div className="form-group">
                    <label htmlFor="new-password">סיסמה חדשה</label>
                    <input
                        id="new-password"
                        type="password"
                        dir="ltr"
                        autoComplete="new-password"
                        minLength={4}
                        required
                        value={password}
                        onChange={event => setPassword(event.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirm-password">אימות סיסמה</label>
                    <input
                        id="confirm-password"
                        type="password"
                        dir="ltr"
                        autoComplete="new-password"
                        minLength={4}
                        required
                        value={confirmPassword}
                        onChange={event => setConfirmPassword(event.target.value)}
                    />
                </div>
                {error && <p className="error" role="alert">{error}</p>}
                {message && <p className="success" role="status">{message}</p>}
                {!message && (
                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'מעדכן...' : 'עדכן סיסמה'}
                    </button>
                )}
                <p className="auth-switch"><Link to="/login">חזרה להתחברות</Link></p>
            </form>
        </div>
    );
};
