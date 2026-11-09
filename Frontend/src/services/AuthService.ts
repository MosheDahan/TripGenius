import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { appConfig } from '../utils/AppConfig';
import { CredentialsModel, RegisterModel, UserModel } from '../models/UserModel';

class AuthService {
    // רישום משתמש חדש
    public async register(user: RegisterModel): Promise<string> {
        const response = await axios.post<{ token: string }>(appConfig.registerUrl, user);
        const token = response.data.token;
        this.saveToken(token);
        return token;
    }

    // התחברות משתמש קיים
    public async login(credentials: CredentialsModel): Promise<string> {
        const response = await axios.post<{ token: string }>(appConfig.loginUrl, credentials);
        const token = response.data.token;
        this.saveToken(token);
        return token;
    }

    // התנתקות
    public logout(): void {
        localStorage.removeItem('token');
    }

    // שמירת הטוקן באחסון מקומי
    public saveToken(token: string): void {
        localStorage.setItem('token', token);
    }

    // שליפת הטוקן
    public getToken(): string | null {
        return localStorage.getItem('token');
    }

    // חילוץ המשתמש מתוך ה-JWT
    public getUserFromToken(): UserModel | null {
        const token = this.getToken();
        if (!token) return null;

        try {
            const decoded = jwtDecode<UserModel & { exp?: number }>(token);
            // בדיקת תוקף הטוקן
            if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                this.logout();
                return null;
            }
            return {
                userId: decoded.userId,
                firstName: decoded.firstName,
                lastName: decoded.lastName,
                email: decoded.email,
                role: decoded.role
            };
        } catch {
            this.logout();
            return null;
        }
    }
}

export const authService = new AuthService();