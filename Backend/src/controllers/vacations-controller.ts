import { Router, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest, verifyToken, verifyAdmin, verifyUser } from '../middlewares/auth-middleware';
import * as vacationsService from '../services/vacations-service';
import { VacationFilter } from '../models/vacation-model';
import fs from 'fs';
import { getUploadsDirectory } from '../utils/storage';

const router = Router();

// הגדרת שמירת תמונות עם multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const destinationPath = getUploadsDirectory();
        if (!fs.existsSync(destinationPath)) {
            fs.mkdirSync(destinationPath, { recursive: true });
        }

        cb(null, destinationPath);
    },
    filename: (req, file, cb) => {
        const extensions: Record<string, string> = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/webp': '.webp',
            'image/gif': '.gif'
        };
        const uniqueName = `${uuidv4()}${extensions[file.mimetype]}`;
        cb(null, uniqueName);
    }
});
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!allowedImageTypes.has(file.mimetype)) {
            cb(new Error('Only JPEG, PNG, WebP, or GIF images are allowed'));
            return;
        }
        cb(null, true);
    }
});
const handleImageUpload = (req: AuthRequest, res: Response, next: (error?: unknown) => void): void => {
    upload.single('image')(req, res, error => {
        if (!error) {
            next();
            return;
        }
        const message = error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE'
            ? 'Image must be 5 MB or smaller'
            : error instanceof Error ? error.message : 'Image upload failed';
        res.status(400).json({ message });
    });
};

// 1. שליפת חופשות עם פילטרים ופגינציה (למשתמשים רשומים)
router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const filter = (req.query.filter as VacationFilter) || 'all';
        const page = parseInt(req.query.page as string) || 1;
        const limit = 9;

        const result = await vacationsService.getVacations(userId, filter, page, limit);
        res.json(result);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// נתונים עבור ה-Chart של המנהל
router.get('/reports/likes', verifyAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const data = await vacationsService.getVacationReports();
        res.json(data);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// הורדת קובץ CSV
router.get('/reports/csv', verifyAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const data = await vacationsService.getVacationReports();

        // יצירת תוכן קובץ CSV עם BOM לתמיכה בעברית באקסל
        let csvContent = '\uFEFFDestination,Likes\n';
        data.forEach(item => {
            csvContent += `"${item.destination.replace(/"/g, '""')}",${item.likesCount}\n`;
        });

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=vacations_report.csv');
        res.status(200).send(csvContent);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// 2. שליפת חופשה בודדת לפי מזהה
router.get('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const vacation = await vacationsService.getVacationById(Number(req.params.id));
        res.json(vacation);
    } catch (err: any) {
        res.status(404).json({ message: err.message });
    }
});

// 3. הוספת חופשה (Admin בלבד)
router.post('/', verifyAdmin, handleImageUpload, async (req: AuthRequest, res: Response) => {
    try {
        const { destination, description, startDate, endDate, price } = req.body;
        const imageName = req.file ? req.file.filename : '';

        const newVacation = await vacationsService.addVacation({
            destination,
            description,
            startDate,
            endDate,
            price: Number(price),
            imageName
        });

        res.status(201).json(newVacation);
    } catch (err: any) {
        if (req.file) {
            fs.unlink(req.file.path, unlinkError => {
                if (unlinkError) console.error('Could not remove rejected vacation image:', unlinkError);
            });
        }
        res.status(400).json({ message: err.message });
    }
});

// 4. עריכת חופשה (Admin בלבד)
router.put('/:id', verifyAdmin, handleImageUpload, async (req: AuthRequest, res: Response) => {
    try {
        const vacationId = Number(req.params.id);
        const { destination, description, startDate, endDate, price } = req.body;
        const imageName = req.file ? req.file.filename : undefined;

        await vacationsService.updateVacation({
            vacationId,
            destination,
            description,
            startDate,
            endDate,
            price: Number(price),
            imageName: imageName || ''
        });

        res.json({ message: 'Vacation updated successfully' });
    } catch (err: any) {
        if (req.file) {
            fs.unlink(req.file.path, unlinkError => {
                if (unlinkError) console.error('Could not remove rejected vacation image:', unlinkError);
            });
        }
        res.status(400).json({ message: err.message });
    }
});

// 5. מחיקת חופשה (Admin בלבד)
router.delete('/:id', verifyAdmin, async (req: AuthRequest, res: Response) => {
    try {
        await vacationsService.deleteVacation(Number(req.params.id));
        res.status(204).send();
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// 6. הוספת לייק לחופשה (משתמש רשום בלבד)
router.post('/:id/like', verifyUser, async (req: AuthRequest, res: Response) => {
    try {
        await vacationsService.addLike(req.user!.userId, Number(req.params.id));
        res.status(201).json({ message: 'Like added' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// 7. הסרת לייק מחופשה (משתמש רשום בלבד)
router.delete('/:id/like', verifyUser, async (req: AuthRequest, res: Response) => {
    try {
        await vacationsService.removeLike(req.user!.userId, Number(req.params.id));
        res.status(200).json({ message: 'Like removed' });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;