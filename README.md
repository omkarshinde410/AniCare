# AniCare

AniCare is a mobile-first veterinary consultation platform connecting farmers with verified veterinary doctors. It includes role-based auth, doctor verification, appointment requests, payment abstraction, mock payments, disease alerts, and PDF generation in a zero-cost open-source setup.

## Features

- Farmer registration and login
- Doctor registration and pending verification
- Admin first-admin logic and approval workflow
- Nearby doctor discovery using approximate location
- Appointment request / approval flow
- Payment abstraction with mock payment demo mode
- PDF medicine instructions with doctor signature
- Disease alert creation and nearby notifications
- Mobile-first responsive UI
- Express + Prisma + SQLite backend

## Tech Stack

- Frontend: React, TypeScript, Vite, React Router
- Backend: Node.js, Express, TypeScript
- Database: SQLite via Prisma (free and self-hosted)
- Auth: JWT + bcrypt
- PDF: jsPDF
- Maps: Leaflet + OpenStreetMap-style usage

## ZERO-COST DEPLOYMENT

This project is designed to remain free to develop and run locally.

- Runtime: Node.js free
- Database: SQLite via Prisma free and local/self-hosted
- Auth: JWT + bcrypt; no paid auth service
- Maps: OpenStreetMap-compatible Leaflet; free to use with proper attribution
- PDFs: jsPDF open-source library
- Hosting: local dev or free static hosting for frontend plus free Node hosting for backend
- No paid SaaS or credit-card services are required by default

## Production-ready setup

For local development, this project uses SQLite by default. For Render production deployment, override the database with PostgreSQL by setting the Render environment variable `DATABASE_URL` to your managed Postgres connection string.

1. Install dependencies:
   npm install
2. Create a local environment file:
   cp .env.example .env
3. For local development, keep:
   DATABASE_URL="file:./dev.db"
4. For Render production, set:
   DATABASE_URL="postgresql://postgres:postgres@host:5432/anicare?schema=public"
5. Sync the database:
   npx prisma db push
6. Build the client bundle:
   npm run build
7. Start the app in production mode:
   NODE_ENV=production npm run start

The server will serve the built frontend from the dist folder and expose the API on the same host.

## Installation

1. Install dependencies:
   npm install
2. Copy environment variables:
   cp .env.example .env
3. Generate Prisma client:
   npx prisma generate
4. Run database migration:
   npx prisma db push
5. Start the app:
   npm run dev

## Environment variables

See .env.example for the full list.

## Authentication flow

- Users sign up with role FARMER, DOCTOR, or ADMIN.
- The first admin is activated immediately.
- Later admin registrations remain pending until an existing admin approves them.
- Doctors must remain pending until an admin approves them.
- JWTs are used for authenticated API requests.

## Payment architecture

- Payment requests are handled through a payment service abstraction.
- The app includes a mock payment mode for development and demos.
- This is intentionally not a real gateway and must be clearly identified as demo usage.

## Video consultation architecture

- The app is structured for a WebRTC-based peer-to-peer consultation flow.
- WebRTC signaling is not hard-coded to a paid platform and is meant to be self-hosted in a production deployment.
- The app documentation marks the signaling server as an integration point if needed.

## Known limitations

- Browser geolocation requires user permission.
- Nearby doctors are approximate based on latitude/longitude values.
- Real payment processing is intentionally mocked for free development.
- Production-grade WebRTC signaling/TURN may require extra infrastructure in some network environments.

## Folder structure

- src/ frontend
- server/ backend
- prisma/ schema and seed data

## Scripts

- npm run dev: start frontend and backend together
- npm run build: build the frontend bundle
- npm run test: run Vitest checks

## License

This project is intended for educational and demonstration use.

