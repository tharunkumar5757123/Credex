# Credex AI Spend Audit

A React/Vite, Node.js, and MongoDB prototype for the Credex AI spend audit assignment. It helps startup founders and engineering managers estimate AI-tool overspend before capturing a report as a lead.

## What is included

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express + MongoDB via Mongoose
- Audit engine: rule-based spending recommendations with 5 automated tests
- Local persistence for form state via `localStorage`

## Run locally

1. Install dependencies

```bash
npm install
cd backend && npm install
```

2. Add backend environment variables

Copy `backend/.env.example` to `backend/.env` and set the values for your local environment.

- `MONGODB_URI` is used by the backend for audit and lead persistence.
- `PORT` controls the backend port and defaults to `4000`.
- `HF_API_KEY` enables the optional Hugging Face audit explanation layer.
- `HF_MODEL` controls the Hugging Face model used for explanations and defaults to `deepseek-ai/DeepSeek-R1:fastest`.
- `EMAIL_PROVIDER` and `RESEND_API_KEY` are included for integration configuration, but this prototype does not currently send email from the backend routes.

3. Start the frontend and backend together

```bash
npm run dev
```

4. Visit `http://localhost:5173`

## Scripts

- `npm run dev` - start Vite frontend and Express backend concurrently
- `npm run lint` - run ESLint
- `npm test` - run the audit-engine tests
- `npm run build` - build the frontend bundle
- `npm run preview` - preview the production build
- `npm run start` - start the Express backend only

## Stack

- React + Vite
- Tailwind CSS
- Node.js
- Express
- MongoDB Atlas / Mongoose

## Notes

This version is intentionally plain JavaScript because the project was already scaffolded that way. The backend safely starts without `MONGODB_URI` for local UI work, but production lead/audit persistence requires MongoDB.
