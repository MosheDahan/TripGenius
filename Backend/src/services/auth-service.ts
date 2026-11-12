import db from '../dal/db';
import { IUser, ICredentials, Role } from '../models/user-model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'crypto';
import nodemailer from 'nodemailer';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

const resetRequestMessage = 'אם קיימת כתובת אימייל זו במערכת, נשלח אליה קישור לאיפוס הסיסמה.';
const emailPattern = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;
let passwordResetTableReady: Promise<void> | null = null;

async function ensurePasswordResetTable(): Promise<void> {
    if (!passwordResetTableReady) {
        passwordResetTableReady = db.query(`
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                token_hash CHAR(64) PRIMARY KEY,
                user_id INT NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_password_reset_user_id (user_id),
                CONSTRAINT fk_password_reset_user
                    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        `).then(() => undefined).catch((error: unknown) => {
            passwordResetTableReady = null;
            throw error;
        });
    }
    await passwordResetTableReady;
}

export async function initializePasswordResetSchema(): Promise<void> {
    await ensurePasswordResetTable();
}

function getPasswordResetMailer(): { transporter: nodemailer.Transporter; from: string } {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.EMAIL_FROM || user;
    if (!host || !user || !pass || !from) {
        throw new Error('Password reset email is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, and EMAIL_FROM.');
    }

    const port = Number(process.env.SMTP_PORT || 587);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error('SMTP_PORT must be a valid port number.');
    }

    return {
        transporter: nodemailer.createTransport({
            host,
            port,
            secure: process.env.SMTP_SECURE === 'true' || port === 465,
            auth: { user, pass }
        }),
        from: `"TripSpark" <${from}>`
    };
}

export async function requestPasswordReset(email: string): Promise<string> {
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailPattern.test(normalizedEmail)) {
        throw new Error('Invalid email address');
    }
    await ensurePasswordResetTable();

    const [users] = await db.query<RowDataPacket[]>(
        'SELECT user_id, first_name FROM users WHERE email = ?',
        [normalizedEmail]
    );
    if (users.length === 0) return resetRequestMessage;

    const { transporter, from } = getPasswordResetMailer();
    const userId = Number(users[0].user_id);
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

    await db.query('DELETE FROM password_reset_tokens WHERE user_id = ?', [userId]);
    await db.query(
        'INSERT INTO password_reset_tokens (token_hash, user_id, expires_at) VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 30 MINUTE))',
        [tokenHash, userId]
    );

    try {
        await transporter.sendMail({
            from,
            to: normalizedEmail,
            subject: 'איפוס סיסמה ל-TripSpark',
            text: `שלום ${String(users[0].first_name)},\n\nלבחירת סיסמה חדשה לחצו על הקישור הבא (בתוקף ל-30 דקות):\n${resetUrl}\n\nאם לא ביקשת לאפס את הסיסמה, אפשר להתעלם מהודעה זו.`
        });
    } catch (error: unknown) {
        await db.query('DELETE FROM password_reset_tokens WHERE token_hash = ?', [tokenHash]);
        throw error;
    }

    return resetRequestMessage;
}

export async function resetPassword(token: string, password: string): Promise<void> {
    if (!token || token.length !== 64 || !/^[a-f0-9]+$/i.test(token)) {
        throw new Error('Reset link is invalid or expired. Request a new one.');
    }
    if (password.length < 4) {
        throw new Error('Password must be at least 4 characters long');
    }
    await ensurePasswordResetTable();

    const tokenHash = createHash('sha256').update(token).digest('hex');
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [tokens] = await connection.query<RowDataPacket[]>(
            'SELECT user_id FROM password_reset_tokens WHERE token_hash = ? AND expires_at > UTC_TIMESTAMP() FOR UPDATE',
            [tokenHash]
        );
        if (tokens.length === 0) {
            throw new Error('Reset link is invalid or expired. Request a new one.');
        }

        const userId = Number(tokens[0].user_id);
        const hashedPassword = await bcrypt.hash(password, 10);
        await connection.query('UPDATE users SET password = ? WHERE user_id = ?', [hashedPassword, userId]);
        await connection.query('DELETE FROM password_reset_tokens WHERE user_id = ?', [userId]);
        await connection.commit();
    } catch (error: unknown) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

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