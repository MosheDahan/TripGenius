import React from 'react';
import './AssistantPage.css';

export const About: React.FC = () => (
    <section className="assistant-page about-page" aria-labelledby="about-title">
        <h1 id="about-title">אודות TripSpark</h1>
        <p>
            TripSpark היא מערכת לתכנון ולניהול חופשות. אפשר למצוא יעדים, לעקוב אחרי חופשות,
            לשמור יעדים שאהבתם ולקבל רעיונות והמלצות לטיול.
        </p>
        <h2>על הפרויקט</h2>
        <p>
            הפרויקט נבנה עם React ו-TypeScript, שרת Node.js ו-Express, מסד נתונים MySQL,
            מנגנון התחברות ותפקידים, וכלי MCP לשאלות על מאגר החופשות.
        </p>
        <h2>פרטי המפתח/ת</h2>
        <p>{process.env.REACT_APP_DEVELOPER_NAME || 'Moshe Dahan'}</p>
    </section>
);
