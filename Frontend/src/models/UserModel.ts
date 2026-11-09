export enum Role {
    User = 'User',
    Admin = 'Admin'
}

export interface UserModel {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
}

export interface CredentialsModel {
    email: string;
    password: string;
}

export interface RegisterModel {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}