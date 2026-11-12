import React, { useState } from 'react';
import axios from 'axios';
import { appConfig } from '../utils/AppConfig';
import { authService } from '../services/AuthService';
import { formatAssistantText } from '../utils/formatAssistantText';
import './AssistantPage.css';

interface ConversationEntry {
    question: string;
    answer: string;
}

export const McpAssistant: React.FC = () => {
    const [question, setQuestion] = useState('');
    const [conversation, setConversation] = useState<ConversationEntry[]>([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const submit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await axios.post<{ answer: string }>(
                appConfig.mcpQueryUrl,
                { question },
                { headers: { Authorization: `Bearer ${authService.getToken()}` } }
            );
            setConversation(previous => [...previous, { question, answer: response.data.answer }]);
            setQuestion('');
        } catch (requestError: unknown) {
            if (axios.isAxiosError<{ message?: string }>(requestError)) {
                setError(requestError.response?.data?.message || 'לא ניתן לקבל תשובה כרגע. בדקו את החיבור ונסו שוב.');
            } else {
                setError('לא ניתן לקבל תשובה כרגע. נסו שוב.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="assistant-page" aria-labelledby="mcp-title">
            <h1 id="mcp-title">שאלות על מאגר החופשות</h1>
            <p>שאלו שאלה בשפה חופשית על נתוני החופשות. התשובה מבוססת על כלי MCP שקוראים את המאגר.</p>
            <form className="assistant-form" onSubmit={submit}>
                <label htmlFor="database-question">השאלה שלכם</label>
                <textarea
                    id="database-question"
                    value={question}
                    onChange={event => setQuestion(event.target.value)}
                    maxLength={1000}
                    required
                    rows={3}
                    placeholder="למשל: כמה חופשות פעילות יש כרגע?"
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'מחפש במאגר...' : 'שאלו את המאגר'}
                </button>
            </form>
            {error && <p className="assistant-error" role="alert">{error}</p>}
            <div className="assistant-conversation" aria-live="polite">
                {conversation.map((entry, index) => (
                    <article className="assistant-answer" key={`${index}-${entry.question}`}>
                        <h2>{entry.question}</h2>
                        <p>{formatAssistantText(entry.answer)}</p>
                    </article>
                ))}
            </div>
        </section>
    );
};
