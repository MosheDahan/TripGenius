import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import db from './dal/db';
import authController from './controllers/auth-controller';
import vacationsController from './controllers/vacations-controller';
import assistantController from './controllers/assistant-controller';
import { getUploadsDirectory } from './utils/storage';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/vacations/images/:imageName', (req: Request, res: Response) => {
    const imageName = path.basename(String(req.params.imageName));
    if (!imageName || imageName !== req.params.imageName) {
        res.status(400).send('Invalid image name');
        return;
    }

    const imagePath = path.join(getUploadsDirectory(), imageName);
    if (!fs.existsSync(imagePath)) {
        res.status(404).send('Image not found');
        return;
    }
    res.sendFile(imagePath, error => {
        if (error) {
            console.error('Image could not be served:', error);
            if (!res.headersSent) res.status(500).send('Image could not be served');
        }
    });
});
app.use('/api/vacations', vacationsController);
app.use('/api', assistantController);

app.get('/api/test-db', async (req: Request, res: Response) => {
    try {
        const [rows] = await db.query('SELECT COUNT(*) AS total_vacations FROM vacations');
        res.json({ message: 'TripGenius Server is running and connected to DB!', data: rows });
    } catch (error: unknown) {
        console.error('Database health check failed:', error);
        res.status(500).json({ message: 'Database is unavailable' });
    }
});

app.use('/api/auth', authController);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});