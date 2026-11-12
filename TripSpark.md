# TripSpark

מערכת Full Stack לניהול חופשות: הרשמה והתחברות, תפקידים והרשאות, חיפוש וסינון חופשות, לייקים, ממשק מנהל, דוחות, המלצות AI ושאלות על מאגר החופשות באמצעות MCP.

## מבנה

- `Database/` — אתחול וייצוא הסכמה והנתונים הראשוניים.
- `Backend/` — REST API ב-Node.js, Express ו-TypeScript.
- `Frontend/` — React ו-TypeScript.
- `Backend/postman/` — אוסף בקשות API לייבוא ל-Postman.

## הרצה מלאה עם Docker

נדרשים Docker Desktop ו-Docker Compose. מתיקיית הפרויקט:

1. העתיקו את `.env.example` לקובץ `.env`.
2. החליפו את סיסמאות MySQL ואת `JWT_SECRET` בערכים חזקים. הגדירו `REACT_APP_DEVELOPER_NAME` לשם המפתח/ת.
3. כדי להפעיל המלצות AI ושאלות MCP ללא תשלום, צרו מפתח ב-[Google AI Studio](https://aistudio.google.com/apikey) והגדירו אותו בשדה `AI_API_KEY` בקובץ `.env`. ברירת המחדל משתמשת ב-Gemini Developer API ובמודל `gemini-3.5-flash-lite`. השאירו את הפרויקט במסלול החינמי ואל תקשרו חשבון חיוב אם אינכם רוצים לשלם; למסלול החינמי יש מכסות וקצב מוגבלים, ובחריגה הבקשות עלולות להיכשל. ללא מפתח, שאר המערכת עדיין זמינה.
4. כדי לאפשר איפוס סיסמה, הגדירו ב-`.env` את פרטי שרת ה-SMTP שלכם: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` ו-`EMAIL_FROM`. עבור Gmail אפשר להשתמש ב-`smtp.gmail.com`, ביציאת `465` עם `SMTP_SECURE=true`, וב-App Password (נדרשת הפעלת אימות דו-שלבי בחשבון Google). אל תשתמשו בסיסמת Google הרגילה ואל תשתפו את ה-App Password. ראו את ההנחיות של Google ל-[App Passwords](https://support.google.com/accounts/answer/185833).
5. הריצו:

   ```powershell
   docker compose up -d --build
   ```

6. פתחו את `http://localhost:3000`. ממשק ה-API זמין ב-`http://localhost:4000`.

Compose בונה את תמונות היישום בשם `tripspark-backend:latest` ו־`tripspark-frontend:latest`. בהרצה של מסד הנתונים בלבד, שם הקונטיינר הוא `tripspark-db`; תמונת MySQL נשארת `mysql:8.0`.

עצירה: `docker compose down`. הנתונים נשמרים ב-volumes; כדי למחוק גם אותם נדרשת במכוון הפקודה `docker compose down -v`.

> קובץ `Database/init.sql` רץ רק באתחול הראשון של volume מסד הנתונים. כדי לאתחל מחדש, יש לייצא תחילה מידע שחשוב לשמור.
> שם פרויקט Docker ומסד הנתונים שונו ל-TripSpark. התקנה קודמת משתמשת ב-volumes ובמסד בשם הישן; Docker לא מעביר אותם אוטומטית. לפני שדרוג התקנה קיימת, גבו וייבאו את הנתונים למסד החדש. ה-volumes הישנים נשארים קיימים, ואל תריצו `docker compose down -v` אלא אם רוצים למחוק את הנתונים.

## הרצה מקומית ללא Docker

נדרשים Node.js 22 ומסד MySQL 8.0. אפשר להפעיל רק את מסד הנתונים דרך `Database/docker-compose.yml`.

1. התקינו תלות והריצו את מסד הנתונים, למשל מתוך תיקיית השורש: `docker compose -f Database/docker-compose.yml up -d`.
2. העתיקו את `Backend/.env.example` אל `Backend/.env` והגדירו את פרטי החיבור, הסיסמה ואת `JWT_SECRET`. ערכי MySQL חייבים להתאים ל-`.env` שבשורש הפרויקט.
3. אופציונלית הגדירו גם `AI_API_KEY`, `AI_BASE_URL` ו-`AI_MODEL`. כדי לאפשר איפוס סיסמה הגדירו גם את הגדרות SMTP כמפורט לעיל.
4. בטרמינל הראשון: `cd Backend`, ‏`npm ci`, ‏`npm run dev`.
5. בטרמינל השני: `cd Frontend`, ‏`npm ci`, ‏`npm start`.

## חשבון מנהל ראשוני

- אימייל: `admin@tripspark.com`
- סיסמה: `Admin1234!`

החשבון נוצר על ידי נתוני האתחול של מסד הנתונים. אין להשתמש בסיסמת ברירת המחדל בסביבת Production.

## יכולות ונתיבי API

- משתמשים: `POST /api/auth/register`, ‏`POST /api/auth/login`.
- איפוס סיסמה: `POST /api/auth/forgot-password` עם `{ "email": "user@example.com" }` שולח קישור למייל אם החשבון קיים; `POST /api/auth/reset-password` עם `{ "token": "...", "password": "..." }` מאפס את הסיסמה. הקישור חד-פעמי ותוקפו 30 דקות. נדרש SMTP מוגדר.
- חופשות ולייקים: `GET /api/vacations`, ‏`POST /api/vacations/:id/like`, ‏`DELETE /api/vacations/:id/like`.
- ניהול חופשות: `POST`, ‏`PUT` ו-`DELETE /api/vacations` (מנהל בלבד; יצירה/עדכון מקבלים `multipart/form-data`).
- דוחות מנהל: `GET /api/vacations/reports/likes`, ‏`GET /api/vacations/reports/csv`.
- המלצה למשתמש מחובר: `POST /api/ai/recommendations` עם `{ "destination": "רומא" }`.
- שאלה למאגר באמצעות כלי MCP למשתמש מחובר: `POST /api/mcp/query` עם `{ "question": "כמה חופשות פעילות יש כרגע?" }`.
- תמונות: `GET /api/vacations/images/:imageName`.

המלצות AI ושאלות MCP משתמשות ב-Gemini API דרך ממשק תאימות OpenAI, המוגדר בצד השרת. המפתח אינו נחשף לדפדפן. ברירות המחדל הן `https://generativelanguage.googleapis.com/v1beta/openai` והמודל `gemini-3.5-flash-lite`; ניתן להגדיר endpoint ומודל אחרים דרך משתני הסביבה. הזמינות והמכסות במסלול החינמי תלויות בחשבון ובמדיניות Google ועשויות להשתנות. לפי [תנאי השימוש של Gemini API](https://ai.google.dev/gemini-api/terms), תוכן שנשלח במסלול החינמי עשוי לשמש לשיפור מוצרי Google — אל תשלחו מידע אישי או סודי.

## בדיקות ובנייה

- Backend: ‏`cd Backend; npm ci; npm run build`.
- Frontend: ‏`cd Frontend; npm ci; npm run build`.
- בדיקות Frontend: ‏`cd Frontend; npm test -- --watchAll=false`.

## ייצוא מסד הנתונים

`Database/init.sql` כולל את הסכמה ואת נתוני הפתיחה (12 חופשות ומנהל). כדי לייצא את המצב העדכני של מסד רץ:

הריצו מתוך PowerShell את `.\Database\export-database.ps1`.

אם מייצאים ל-`Database/export.sql`, יש לוודא לפני הגשה שהקובץ מכיל רק נתונים שמותר למסור ושאין בו סודות. אין לכלול `.env` או מפתחות AI בארכיון.

## GitHub והגשה

קישור GitHub: https://github.com/MosheDahan/TripSpark
לפני הגשה:

1. ודאו ששם המפתח/ת הוגדר ב-`.env` ובניית Docker מעודכנת.
2. העלו את הקוד ל-GitHub ועדכנו כאן את כתובת המאגר.
3. צרפו `Database/export.sql` עדכני ואת `Backend/postman/TripSpark.postman_collection.json`.
4. צרו ZIP אחד עם שם התיקייה הנדרש, ללא `node_modules`, קובצי `.env`, תיקיות `build`/`dist` או סודות:

   ```powershell
   .\package-submission.ps1 -StudentName "Full Name"
   ```

   הקובץ ייווצר בתיקיית האב של הפרויקט. יש להעלות אותו לאתר הקורס באופן ידני.
