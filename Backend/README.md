# TripSpark Backend

Express REST API written in TypeScript. For complete setup, environment variables, Docker, API routes, and submission steps, see the project [README](../TripSpark.md).

## Local development

1. Configure `.env` with the MySQL connection settings, a strong `JWT_SECRET`, and (optionally) `AI_API_KEY`, `AI_BASE_URL`, and `AI_MODEL`. For Google AI Studio, use a Gemini API key, `https://generativelanguage.googleapis.com/v1beta/openai`, and `gemini-3.5-flash-lite`. Keep the key server-side and check Google's free-tier quotas and data-use terms.
2. Run `npm ci`.
3. Run `npm run dev`, or `npm run build` followed by `npm start`.

The Postman collection is in `postman/TripSpark.postman_collection.json`.
