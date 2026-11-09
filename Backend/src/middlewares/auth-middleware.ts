import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../models/user-model';

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET must be configured');
    }
    return secret;
}

export interface UserPayload {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
}

export interface AuthRequest extends Request {
    user?: UserPayload;
}

// בדיקה שהמשתמש מחובר (רשום)
export function verifyToken(req: AuthRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        res.status(401).json({ message: 'Access denied. No token provided.' });
        return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Access denied. Invalid token format.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, getJwtSecret()) as UserPayload;
        req.user = decoded;
        next();
    } catch (err) {
        if (err instanceof Error && err.message === 'JWT_SECRET must be configured') {
            console.error(err.message);
            res.status(500).json({ message: 'Authentication is not configured on the server.' });
            return;
        }
        res.status(403).json({ message: 'Invalid or expired token.' });
    }
}

// בדיקה שהמשתמש הוא Admin
export function verifyAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
    verifyToken(req, res, () => {
        if (req.user?.role !== Role.Admin) {
            res.status(403).json({ message: 'Access denied. Admins only.' });
            return;
        }
        next();
    });
}

export function verifyUser(req: AuthRequest, res: Response, next: NextFunction): void {
    verifyToken(req, res, () => {
        if (req.user?.role !== Role.User) {
            res.status(403).json({ message: 'Access denied. Regular users only.' });
            return;
        }
        next();
    });
}