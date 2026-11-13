import React from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { CredentialsModel } from '../models/UserModel';
import { useAuth } from '../context/AuthContext';
import './AuthForm.css';

export const Login: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<CredentialsModel>();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [submitError, setSubmitError] = React.useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const onSubmit = async (data: CredentialsModel) => {
        setSubmitError(null);
        setIsSubmitting(true);
        try {
            await login(data);
            navigate('/');
        } catch (error: unknown) {
            if (axios.isAxiosError<{ message?: string }>(error)) {
                if (!error.response) {
                    setSubmitError('לא ניתן להתחבר לשרת. בדוק שהשרת פועל ונסה שוב.');
                } else if (error.response.status === 401) {
                    setSubmitError('כתובת האימייל או הסיסמה שגויים.');
                } else {
                    setSubmitError(error.response.data?.message || 'ההתחברות נכשלה. נסה שוב.');
                }
            } else if (error instanceof Error && error.message) {
                setSubmitError(error.message);
            } else {
                setSubmitError('ההתחברות נכשלה. נסה שוב.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-card" onSubmit={handleSubmit(onSubmit)}>
                <h2>התחברות ל-TripSpark</h2>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        dir="ltr"
                        {...register('email', {
                            required: 'נא להזין Email',
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                message: 'כתובת אימייל אינה תקינה (חובה לכלול דומיין וסיומת כגון example@mail.com)'
                            }
                        })}
                    />
                    {errors.email && <span className="error">{errors.email.message}</span>}
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        dir="ltr"
                        {...register('password', {
                            required: 'נא להזין Password',
                            minLength: { value: 4, message: 'Password חייב להכיל לפחות 4 תווים' }
                        })}
                    />
                    {errors.password && <span className="error">{errors.password.message}</span>}
                </div>

                {submitError && <p className="error" role="alert">{submitError}</p>}

                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'מתחבר...' : 'התחבר'}
                </button>

                <p className="auth-switch">
                    עדיין אין לך חשבון? <Link to="/register">הרשם כאן</Link>
                </p>
            </form>
        </div>
    );
};