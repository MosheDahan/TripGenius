import { Router, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import {
    login,
    register,
    requestPasswordReset,
    resetPassword
} from '../services/auth-service';

const router = Router();
const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message: 'בוצעו יותר מדי ניסיונות. נסה שוב בעוד 15 דקות.' }
});
const resetRequestLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    keyGenerator: req => {
        const email = typeof req.body?.email === 'string'
            ? req.body.email.trim().toLowerCase()
            : '';
        return email || 'invalid-email';
    },
    message: { message: 'בוצעו יותר מדי בקשות עבור כתובת זו. נסה שוב בעוד 15 דקות.' }
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const token = await register({ firstName, lastName, email, password });
        res.status(201).json({ token });
    } catch (err: unknown) {
        if (err instanceof Error && err.message === 'Email is already registered') {
            res.status(409).json({ message: err.message });
            return;
        }
        if (err instanceof Error && [
            'All fields are required',
            'Invalid email address',
            'Password must be at least 4 characters long'
        ].includes(err.message)) {
            res.status(400).json({ message: err.message });
            return;
        }
        console.error('Registration failed:', err);
        res.status(500).json({ message: 'Registration failed. Please try again later.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const token = await login({ email, password });
        res.status(200).json({ token });
    } catch (err: unknown) {
        if (err instanceof Error && [
            'All fields are required',
            'Invalid email address',
            'Password must be at least 4 characters long'
        ].includes(err.message)) {
            res.status(400).json({ message: err.message });
            return;
        }
        if (err instanceof Error && err.message === 'Incorrect email or password') {
            res.status(401).json({ message: err.message });
            return;
        }
        console.error('Login failed:', err);
        res.status(500).json({ message: 'Login failed. Please try again later.' });
    }
});

router.post('/forgot-password', resetRequestLimiter, async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (typeof email !== 'string' || !email.trim()) {
            res.status(400).json({ message: 'נא להזין כתובת אימייל.' });
            return;
        }
        const message = await requestPasswordReset(email);
        res.status(200).json({ message });
    } catch (err: unknown) {
        if (err instanceof Error && err.message === 'Invalid email address') {
            res.status(400).json({ message: err.message });
            return;
        }
        console.error('Password reset request failed:', err);
        res.status(500).json({ message: 'לא ניתן לשלוח קישור לאיפוס כרגע. בדוק את הגדרות הדואר ונסה שוב מאוחר יותר.' });
    }
});

router.post('/reset-password', resetPasswordLimiter, async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body;
        if (typeof token !== 'string' || typeof password !== 'string') {
            res.status(400).json({ message: 'קישור האיפוס או הסיסמה אינם תקינים.' });
            return;
        }
        await resetPassword(token, password);
        res.status(200).json({ message: 'הסיסמה עודכנה. אפשר להתחבר עם הסיסמה החדשה.' });
    } catch (err: unknown) {
        if (err instanceof Error && [
            'Reset link is invalid or expired. Request a new one.',
            'Password must be at least 4 characters long'
        ].includes(err.message)) {
            res.status(400).json({ message: err.message });
            return;
        }
        console.error('Password reset failed:', err);
        res.status(500).json({ message: 'איפוס הסיסמה נכשל. נסה שוב מאוחר יותר.' });
    }
});

export default router;