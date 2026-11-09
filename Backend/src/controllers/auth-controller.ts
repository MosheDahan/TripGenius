import { Router, Request, Response } from 'express';
import { register, login } from '../services/auth-service';

const router = Router();

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

export default router;