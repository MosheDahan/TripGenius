# TripGenius Backend

Express REST API written in TypeScript. For complete setup, environment variables, Docker, API routes, and submission steps, see the project [README](../README.md).

## Local development

1. Configure `.env` with the MySQL connection settings, a strong `JWT_SECRET`, and (optionally) `AI_API_KEY`, `AI_BASE_URL`, and `AI_MODEL`.
2. Run `npm ci`.
3. Run `npm run dev`, or `npm run build` followed by `npm start`.

The Postman collection is in `postman/TripGenius.postman_collection.json`.
