import db from '../dal/db';
import { IVacation, VacationFilter } from '../models/vacation-model';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs';
import path from 'path';
import { getUploadsDirectory } from '../utils/storage';

function isValidDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function todayAsLocalDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function validateVacation(vacation: IVacation, allowPastStartDate: boolean): void {
    const { destination, description, startDate, endDate, price, imageName } = vacation;
    if (!destination?.trim() || !description?.trim() || !startDate || !endDate || !imageName) {
        throw new Error('All fields are required');
    }
    if (!/[\u0590-\u05FF]/u.test(destination) || /[A-Za-z]/.test(destination)) {
        throw new Error('שם היעד חייב להיות בעברית');
    }
    if (!Number.isFinite(price) || price < 0 || price > 10000) {
        throw new Error('Price must be between 0 and 10,000');
    }
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
        throw new Error('Vacation dates are invalid');
    }
    if (endDate < startDate) {
        throw new Error('End date cannot be earlier than start date');
    }
    if (!allowPastStartDate && startDate < todayAsLocalDate()) {
        throw new Error('Start date cannot be in the past');
    }
}

// שליפת חופשות עם פילטור, פגינציה, כמות לייקים ובדיקת לייק של המשתמש
export async function getVacations(
    userId: number,
    filter: VacationFilter = 'all',
    page: number = 1,
    limit: number = 9
): Promise<{ vacations: IVacation[]; totalCount: number }> {
    const offset = (page - 1) * limit;
    let whereClause = '';

    if (filter === 'liked') {
        whereClause = 'WHERE EXISTS (SELECT 1 FROM likes WHERE likes.vacation_id = v.vacation_id AND likes.user_id = ?)';
    } else if (filter === 'active') {
        whereClause = 'WHERE CURRENT_DATE() BETWEEN v.start_date AND v.end_date';
    } else if (filter === 'upcoming') {
        whereClause = 'WHERE v.start_date > CURRENT_DATE()';
    }

    const queryParams: any[] = [];
    if (filter === 'liked') {
        queryParams.push(userId);
    }

    // ספירת סך הכל חופשות התואמות לסינון (עבור החישוב של כמות הדפים בפרונט)
    const countSql = `SELECT COUNT(*) as total FROM vacations v ${whereClause}`;
    const [countResult] = await db.query<RowDataPacket[]>(countSql, queryParams);
    const totalCount = countResult[0].total;

    // שליפת הנתונים בפועל
    const sql = `
        SELECT 
            v.vacation_id AS vacationId,
            v.destination,
            v.description,
            DATE_FORMAT(v.start_date, '%Y-%m-%d') AS startDate,
            DATE_FORMAT(v.end_date, '%Y-%m-%d') AS endDate,
            v.price,
            v.image_name AS imageName,
            COUNT(l.user_id) AS likesCount,
            EXISTS(
                SELECT 1 FROM likes 
                WHERE likes.vacation_id = v.vacation_id AND likes.user_id = ?
            ) AS isLiked
        FROM vacations v
        LEFT JOIN likes l ON v.vacation_id = l.vacation_id
        ${whereClause}
        GROUP BY v.vacation_id
        ORDER BY v.start_date ASC
        LIMIT ? OFFSET ?
    `;

    const selectParams = [userId, ...queryParams, limit, offset];
    const [rows] = await db.query<RowDataPacket[]>(sql, selectParams);

    const vacations: IVacation[] = rows.map(row => ({
        ...row,
        isLiked: Boolean(row.isLiked),
        price: Number(row.price),
        likesCount: Number(row.likesCount)
    })) as IVacation[];

    return { vacations, totalCount };
}

// שליפת חופשה בודדת (שימושי לדף עריכה)
export async function getVacationById(vacationId: number): Promise<IVacation> {
    const sql = `
        SELECT 
            vacation_id AS vacationId,
            destination,
            description,
            DATE_FORMAT(start_date, '%Y-%m-%d') AS startDate,
            DATE_FORMAT(end_date, '%Y-%m-%d') AS endDate,
            price,
            image_name AS imageName
        FROM vacations
        WHERE vacation_id = ?
    `;
    const [rows] = await db.query<RowDataPacket[]>(sql, [vacationId]);
    if (rows.length === 0) {
        throw new Error('Vacation not found');
    }
    return rows[0] as IVacation;
}

// הוספת חופשה חדשה (Admin בלבד)
export async function addVacation(vacation: IVacation): Promise<IVacation> {
    validateVacation(vacation, false);
    const { destination, description, startDate, endDate, price, imageName } = vacation;

    const [result] = await db.query<ResultSetHeader>(
        'INSERT INTO vacations (destination, description, start_date, end_date, price, image_name) VALUES (?, ?, ?, ?, ?, ?)',
        [destination.trim(), description.trim(), startDate, endDate, price, imageName]
    );

    return { ...vacation, vacationId: result.insertId };
}

// עריכת חופשה (Admin בלבד)
export async function updateVacation(vacation: IVacation): Promise<void> {
    const { vacationId, destination, description, startDate, endDate, price, imageName } = vacation;
    const currentVacation = await getVacationById(Number(vacationId));
    validateVacation({
        ...currentVacation,
        destination,
        description,
        startDate,
        endDate,
        price,
        imageName: imageName || currentVacation.imageName
    }, true);

    let sql = 'UPDATE vacations SET destination = ?, description = ?, start_date = ?, end_date = ?, price = ?';
    const params: any[] = [destination.trim(), description.trim(), startDate, endDate, price];

    if (imageName) {
        sql += ', image_name = ?';
        params.push(imageName);
    }

    sql += ' WHERE vacation_id = ?';
    params.push(vacationId);

    await db.query(sql, params);
    if (imageName && imageName !== currentVacation.imageName) {
        const oldImagePath = path.join(getUploadsDirectory(), path.basename(currentVacation.imageName));
        if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
        }
    }
}

// מחיקת חופשה (Admin בלבד)
export async function deleteVacation(vacationId: number): Promise<void> {
    const vacation = await getVacationById(vacationId);
    
    // מחיקה מה-DB (טבלת likes נמחקת אוטומטית בזכות ON DELETE CASCADE)
    await db.query('DELETE FROM vacations WHERE vacation_id = ?', [vacationId]);

    // מחיקת קובץ התמונה מהדיסק אם קיים
    const imagePath = path.join(getUploadsDirectory(), path.basename(vacation.imageName));
    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }
}

// הוספת לייק (User)
export async function addLike(userId: number, vacationId: number): Promise<void> {
    await db.query('INSERT IGNORE INTO likes (user_id, vacation_id) VALUES (?, ?)', [userId, vacationId]);
}

// הסרת לייק (User)
export async function removeLike(userId: number, vacationId: number): Promise<void> {
    await db.query('DELETE FROM likes WHERE user_id = ? AND vacation_id = ?', [userId, vacationId]);
}

// שליפת נתוני לייקים פר חופשה עבור תרשים וקובץ CSV
export async function getVacationReports(): Promise<{ destination: string; likesCount: number }[]> {
    const sql = `
        SELECT 
            v.destination,
            COUNT(l.user_id) AS likesCount
        FROM vacations v
        LEFT JOIN likes l ON v.vacation_id = l.vacation_id
        GROUP BY v.vacation_id, v.destination
        ORDER BY v.vacation_id ASC
    `;
    const [rows] = await db.query<RowDataPacket[]>(sql);
    return rows.map(r => ({
        destination: r.destination,
        likesCount: Number(r.likesCount)
    }));
}