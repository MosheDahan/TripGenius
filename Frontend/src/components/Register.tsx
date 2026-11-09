import React from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterModel } from '../models/UserModel';
import { useAuth } from '../context/AuthContext';
import './AuthForm.css';

export const Register: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterModel>();
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [submitError, setSubmitError] = React.useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const onSubmit = async (data: RegisterModel) => {
        setSubmitError(null);
        setIsSubmitting(true);
        try {
            await registerUser(data);
            navigate('/');
        } catch (error: unknown) {
            if (axios.isAxiosError<{ message?: string }>(error)) {
                if (!error.response) {
                    setSubmitError('לא ניתן להתחבר לשרת. בדוק שהשרת פועל ונסה שוב.');
                } else if (error.response.status === 409) {
                    setSubmitError('כתובת האימייל כבר רשומה במערכת.');
                } else {
                    setSubmitError(error.response.data?.message || 'ההרשמה נכשלה. נסה שוב.');
                }
            } else if (error instanceof Error && error.message) {
                setSubmitError(error.message);
            } else {
                setSubmitError('ההרשמה נכשלה. נסה שוב.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-card" onSubmit={handleSubmit(onSubmit)}>
                <h2>יצירת חשבון חדש</h2>

                <div className="form-group">
                    <label>שם פרטי</label>
                    <input
                        type="text"
                        {...register('firstName', { required: 'נא להזין שם פרטי' })}
                    />
                    {errors.firstName && <span className="error">{errors.firstName.message}</span>}
                </div>

                <div className="form-group">
                    <label>שם משפחה</label>
                    <input
                        type="text"
                        {...register('lastName', { required: 'נא להזין שם משפחה' })}
                    />
                    {errors.lastName && <span className="error">{errors.lastName.message}</span>}
                </div>

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
                    {isSubmitting ? 'נרשם...' : 'הרשם'}
                </button>

                <p className="auth-switch">
                    כבר רשום במערכת? <Link to="/login">התחבר כאן</Link>
                </p>
            </form>
        </div>
    );
};