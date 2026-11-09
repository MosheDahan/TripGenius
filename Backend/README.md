# TripGenius Backend

Express REST API written in TypeScript. For complete setup, environment variables, Docker, API routes, and submission steps, see the project [README](../README.md).

## Local development

1. Configure `.env` with the MySQL connection settings, a strong `JWT_SECRET`, and (optionally) `AI_API_KEY`, `AI_BASE_URL`, and `AI_MODEL`. For Google AI Studio, use a Gemini API key, `https://generativelanguage.googleapis.com/v1beta/openai`, and `gemini-3.5-flash-lite`. Keep the key server-side and check Google's free-tier quotas and data-use terms.
2. To enable password reset, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, and `FRONTEND_URL`. Gmail users can use an App Password with `smtp.gmail.com`; regular account passwords are not supported. Reset links expire after 30 minutes.
3. Run `npm ci`.
4. Run `npm run dev`, or `npm run build` followed by `npm start`.

The Postman collection is in `postman/TripGenius.postman_collection.json`.
