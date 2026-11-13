import db from '../dal/db';
import { IUser, ICredentials, Role } from '../models/user-model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

const emailPattern = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET must be configured');
    }
    return secret;
}

// יצירת טוקן JWT
function generateToken(user: IUser): string {
    const payload = {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
    };
    return jwt.sign(payload, getJwtSecret(), { expiresIn: '4h' });
}

// הרשמת משתמש חדש
export async function register(user: IUser): Promise<string> {
    // בדיקת שדות חובה ומינימום 4 תווים לסיסמה
    if (!user.firstName || !user.lastName || !user.email || !user.password) {
        throw new Error('All fields are required');
    }
    if (!emailPattern.test(user.email)) {
        throw new Error('Invalid email address');
    }
    if (user.password.length < 4) {
        throw new Error('Password must be at least 4 characters long');
    }

    // בדיקה האם האימייל כבר תפוס במערכת
    const [existingUsers] = await db.query<RowDataPacket[]>(
        'SELECT email FROM users WHERE email = ?',
        [user.email]
    );

    if (existingUsers.length > 0) {
        throw new Error('Email is already registered');
    }

    // הצפנת הסיסמה
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const role = Role.User; // משתמש חדש תמיד נרשם כ-User

    // שמירה ב-DB
    const [result] = await db.query<ResultSetHeader>(
        'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [user.firstName, user.lastName, user.email, hashedPassword, role]
    );

    user.userId = result.insertId;
    user.role = role;
    delete user.password;

    return generateToken(user);
}

// התחברות משתמש קיים
export async function login(credentials: ICredentials): Promise<string> {
    if (!credentials.email || !credentials.password) {
        throw new Error('All fields are required');
    }
    if (!emailPattern.test(credentials.email)) {
        throw new Error('Invalid email address');
    }
    if (credentials.password.length < 4) {
        throw new Error('Password must be at least 4 characters long');
    }

    // שליפת המשתמש לפי האימייל
    const [users] = await db.query<RowDataPacket[]>(
        'SELECT user_id, first_name, last_name, email, password, role FROM users WHERE email = ?',
        [credentials.email.trim()]
    );

    if (users.length === 0) {
        throw new Error('Incorrect email or password');
    }

    const dbUser = users[0];

    // השוואת הסיסמה המוצפנת
    const isPasswordMatch = await bcrypt.compare(credentials.password, dbUser.password);
    if (!isPasswordMatch) {
        throw new Error('Incorrect email or password');
    }

    const loggedUser: IUser = {
        userId: dbUser.user_id,
        firstName: dbUser.first_name,
        lastName: dbUser.last_name,
        email: dbUser.email,
        role: dbUser.role as Role
    };

    return generateToken(loggedUser);
}