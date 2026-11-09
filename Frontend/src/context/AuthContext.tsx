import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserModel, Role, CredentialsModel, RegisterModel } from '../models/UserModel';
import { authService } from '../services/AuthService';
import { notify } from '../utils/Notify';

interface AuthContextType {
    user: UserModel | null;
    token: string | null;
    isAdmin: boolean;
    login: (credentials: CredentialsModel) => Promise<void>;
    register: (userData: RegisterModel) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserModel | null>(authService.getUserFromToken());
    const [token, setToken] = useState<string | null>(authService.getToken());

    useEffect(() => {
        setUser(authService.getUserFromToken());
    }, []);

    const login = async (credentials: CredentialsModel) => {
        const receivedToken = await authService.login(credentials);
        setToken(receivedToken);
        setUser(authService.getUserFromToken());
        notify.success('התחברת בהצלחה!');
    };

    const register = async (userData: RegisterModel) => {
        const receivedToken = await authService.register(userData);
        setToken(receivedToken);
        setUser(authService.getUserFromToken());
        notify.success('ההרשמה הושלמה בהצלחה!');
    };

    const logout = () => {
        authService.logout();
        setToken(null);
        setUser(null);
        notify.success('התנתקת מהמערכת בהצלחה.');
    };

    const isAdmin = user?.role === Role.Admin;

    return (
        <AuthContext.Provider value={{ user, token, isAdmin, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};