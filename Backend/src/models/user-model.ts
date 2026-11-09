export enum Role {
    User = 'User',
    Admin = 'Admin'
}

export interface IUser {
    userId?: number;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role?: Role;
}

export interface ICredentials {
    email: string;
    password: string;
}