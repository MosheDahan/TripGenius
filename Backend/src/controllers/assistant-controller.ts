import { Router, Request, Response } from 'express';
import { verifyToken } from '../middlewares/auth-middleware';
import {
    answerVacationQuestion,
    AssistantServiceError,
    getTravelRecommendation
} from '../services/assistant-service';

const router = Router();

function sendAssistantError(error: unknown, res: Response): void {
    if (error instanceof AssistantServiceError) {
        if (error.statusCode >= 500) console.error(error.message);
        res.status(error.statusCode).json({ message: error.message });
        return;
    }
    console.error('Assistant request failed:', error);
    res.status(500).json({ message: 'The assistant request failed. Please try again later.' });
}

router.post('/ai/recommendations', verifyToken, async (req: Request, res: Response) => {
    try {
        const recommendation = await getTravelRecommendation(
            typeof req.body?.destination === 'string' ? req.body.destination : ''
        );
        res.json({ recommendation });
    } catch (error: unknown) {
        sendAssistantError(error, res);
    }
});

router.post('/mcp/query', verifyToken, async (req: Request, res: Response) => {
    try {
        const answer = await answerVacationQuestion(
            typeof req.body?.question === 'string' ? req.body.question : ''
        );
        res.json({ answer });
    } catch (error: unknown) {
        sendAssistantError(error, res);
    }
});

export default router;
