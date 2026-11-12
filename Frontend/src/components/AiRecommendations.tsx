import React, { useState } from 'react';
import axios from 'axios';
import { appConfig } from '../utils/AppConfig';
import { authService } from '../services/AuthService';
import { formatAssistantText } from '../utils/formatAssistantText';
import './AssistantPage.css';

export const AiRecommendations: React.FC = () => {
    const [destination, setDestination] = useState('');
    const [recommendation, setRecommendation] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const submit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setRecommendation('');
        setIsLoading(true);
        try {
            const response = await axios.post<{ recommendation: string }>(
                appConfig.recommendationUrl,
                { destination },
                { headers: { Authorization: `Bearer ${authService.getToken()}` } }
            );
            setRecommendation(response.data.recommendation);
        } catch (requestError: unknown) {
            if (axios.isAxiosError<{ message?: string }>(requestError)) {
                setError(requestError.response?.data?.message || 'לא ניתן לקבל המלצה כרגע. בדקו את החיבור ונסו שוב.');
            } else {
                setError('לא ניתן לקבל המלצה כרגע. נסו שוב.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="assistant-page" aria-labelledby="recommendations-title">
            <h1 id="recommendations-title">המלצת טיול מבוססת AI</h1>
            <p>כתבו יעד וקבלו רעיונות לתכנון הטיול.</p>
            <form className="assistant-form" onSubmit={submit}>
                <label htmlFor="recommendation-destination">יעד לטיול</label>
                <input
                    id="recommendation-destination"
                    value={destination}
                    onChange={event => setDestination(event.target.value)}
                    maxLength={100}
                    required
                    placeholder="לדוגמה: רומא"
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'מכין המלצה...' : 'קבלו המלצה'}
                </button>
            </form>
            {error && <p className="assistant-error" role="alert">{error}</p>}
            {recommendation && (
                <article className="assistant-answer" aria-live="polite">
                    <h2>ההמלצה שלכם</h2>
                    <p>{formatAssistantText(recommendation)}</p>
                </article>
            )}
        </section>
    );
};
