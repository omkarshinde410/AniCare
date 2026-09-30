# AniCare Architecture

## Overview

AniCare is a role-based veterinary-care application. Farmers discover nearby approved veterinarians, request appointments, receive health and appointment updates, and join consultations. Doctors manage their profile and appointments, prepare care documents, and use video calls. Administrators review doctor and administrator approvals.

The project has two runtime layers:

1. A React single-page application served by Vite during development and from `dist/` in production.
2. An Express API backed by Prisma and PostgreSQL, plus a WebSocket endpoint for WebRTC signaling.

## Technology Stack

| Area | Technology | Purpose |
| --- | --- | --- |
| UI | React 19, TypeScript | Component-based, typed application screens and interactions |
| Frontend build | Vite 8 | Local development server and production asset bundling |
| Routing | React Router | Client-side routes for farmer, doctor, admin, and shared screens |
| HTTP | Axios | API requests; an interceptor attaches the saved bearer token |
| API | Node.js, Express 5, TypeScript | REST endpoints, validation, authentication middleware, and static production hosting |
| Database access | Prisma 6 | Models and queries for users, profiles, appointments, payments, documents, alerts, and notifications |
| Database | PostgreSQL | Relational persistence configured through `DATABASE_URL` |
| Input validation | Zod | Validates API request bodies and rejects invalid inputs |
| Authentication | JWT and bcryptjs | Signed bearer sessions and password hashing |
| Security and logging | Helmet, CORS, Morgan | HTTP security headers, cross-origin policy, and request logs |
| Maps | Leaflet, React Leaflet, OpenStreetMap-compatible tiles | Interactive doctor map, markers, and popups |
| Video | Browser WebRTC APIs, WebSocket (`ws`) | Peer-to-peer audio/video with application-hosted signaling |
| PDF output | jsPDF | Client-side medicine and care-document downloads |
| Tests | Vitest, Supertest | Unit tests and API route tests |

The database provider is PostgreSQL in `prisma/schema.prisma` and `.env.example`. Some older README setup text refers to SQLite; use the Prisma schema and environment template as the current configuration source.

## Repository Map

```text
src/
  App.tsx                    Routes, role navigation, global toolbar
  api.ts                     Axios client and bearer-token interceptor
  Language.tsx               English/Hindi/Marathi UI translations and persistence
  notificationNavigation.ts  Notification-to-route mapping
  components/                Shared logout, notification toast, and video-call UI
  hooks/                     Client-side shared hooks
  pages/                     Farmer, doctor, admin, auth, and care screens

server/
  index.ts                   Express setup and API route registration
  middleware/auth.ts         JWT verification and role authorization
  routes/                    REST handlers grouped by capability
  diseasePrediction.ts       Dataset parsing and k-NN scoring
  signaling.ts               Authenticated WebSocket rooms for video calls
  appointmentWindow.ts       India-time appointment-window helpers
  __tests__/                 Backend behavior tests

prisma/schema.prisma         Relational data model
cleaned_animal_disease_prediction.csv
                            Bundled reference records used by symptom matching
```

## Application Startup and Request Flow

### Development

- `npm run dev` starts the Vite client and Express server together.
- Vite listens on port `5173` and proxies `/api` requests to `http://localhost:4000`.
- Express listens on `PORT` (default `4000`), exposes `/api/health`, and registers feature routers under `/api/*`.
- The WebSocket signaling endpoint is `/ws/signaling` on the Express HTTP server.

### Production

- `npm run build` runs `tsc -b` and creates the Vite production bundle in `dist/`.
- With `NODE_ENV=production`, Express serves `dist/` and falls back to `index.html` for client-side routes.
- `npm start` starts the Express application. The production frontend and API can share a host.

## Authentication and Authorization

1. Registration is validated by the auth route. Passwords are hashed with bcrypt before storage.
2. Login checks the submitted password, applies role/status rules, and issues a signed JWT.
3. The frontend stores the token and user summary in local storage. The Axios request interceptor sends `Authorization: Bearer <token>` for API calls.
4. `requireAuth` verifies the JWT and attaches its user ID, email, and role to the request.
5. `requireRole` limits protected operations to the allowed roles.

The first administrator is activated by the current registration logic; later administrator registrations require approval. Doctors require administrator approval before they become active and discoverable. Sign-out removes the local token and user summary; JWTs are stateless and are not individually revoked server-side.

## Main User Flows

### Doctor discovery and appointment booking

1. The farmer grants browser geolocation, or the map uses its default center.
2. The client requests `/api/doctors/nearby` with coordinates and an optional search term.
3. The API returns approved doctors with coordinates inside the requested radius, sorted by approximate distance.
4. Map markers show doctor locations. Selecting a marker scrolls to that doctor's information card below the map; the nearby list remains in place.
5. The farmer submits an appointment request. The server validates its shape, end/start ordering, and that the appointment start is in the future using the configured India offset (`+05:30` by default).
6. The request is saved as `REQUESTED`, and notifications are created for both participants. A doctor can approve or reject the request.

### Notifications

Notification records are stored per user and can be marked read. The inbox and toast poll the authenticated notifications endpoint. Clicking a notification marks it read and chooses a role-specific route based on its type. Appointment-related notifications carry an appointment ID; appointment pages use it to scroll to the matching card.

### Video consultation

1. A video call is available for an approved appointment during its scheduled time window.
2. Each participant opens a WebSocket with an appointment ID and JWT. The signaling server verifies the token, appointment status, time window, and participant membership, then places the socket in a two-person room.
3. The first participant to join creates a `VIDEO_CALL_STARTED` notification for the other participant.
4. The clients exchange WebRTC offer, answer, and ICE-candidate messages through the WebSocket. Media flows directly between browsers when network conditions allow.
5. Ending a call sends a hangup message; the server relays it and both clients stop local tracks and close their peer connections. Unexpected socket closure notifies the remaining peer.

Google STUN servers are configured by default. A self-hosted TURN relay may be supplied at build time through `VITE_TURN_URL`, `VITE_TURN_USERNAME`, and `VITE_TURN_CREDENTIAL`. TURN is often needed when restrictive NATs prevent a direct peer connection. The app does not use a paid video API.

### Care documents and payments

Doctors can create medicine/care documents for their appointments. The frontend renders downloadable PDFs with jsPDF. Payment requests and completion use the application's demo payment flow; they are not charges through a real payment processor.

### Language selection

English is the default locale. A global selector switches between English, Hindi, and Marathi. The selection is stored in local storage, and the document language attribute is updated. Translations are local phrase catalogs, so no paid translation provider or network request is involved. Dynamic data without a catalog entry remains in English.

## Symptom Prediction (k-Nearest Neighbors)

The prediction feature is implemented locally in `server/diseasePrediction.ts` and exposed to farmers through `/api/disease-predictions`.

1. The server loads `cleaned_animal_disease_prediction.csv` and parses quoted CSV fields.
2. Each row becomes a record containing animal type, predicted disease, and a normalized symptom set. The set includes the four free-text symptom columns and supported yes/no symptom columns.
3. User-selected symptoms are normalized in the same way. Records from other animal types are excluded.
4. Similarity is Jaccard similarity:

   `similarity = |selected symptoms intersect record symptoms| / |selected symptoms union record symptoms|`

5. Records with no shared symptoms are ignored. The five most similar records vote for disease labels; similarities are summed per disease.
6. The API returns up to three disease labels, normalized vote percentages, and the number of contributing records.

This is a small, dataset-driven k-nearest-neighbor classifier, not a trained neural network or a clinically validated diagnostic model. The returned percentage is relative to the selected neighbors; it is not a calibrated probability that an animal has the disease. The UI describes it as an experimental dataset match and recommends veterinary assessment.

## Validation and Tests

- `npm run build`: TypeScript project check and frontend production build.
- `npm test`: Vitest suite for appointment time helpers, disease matching, notification routes, and API behavior.
- `npm run lint`: ESLint across the repository.

Prediction tests check a known animal/symptom profile, available dataset options, and the no-match case. Appointment-time tests cover India-time behavior and reject past/invalid starts. Notification navigation tests check role-aware destinations and encoded appointment IDs.

## Environment Variables

See `.env.example` for the development template.

- `DATABASE_URL`: PostgreSQL connection string used by Prisma.
- `JWT_SECRET`: signing secret; replace the template value outside local development.
- `PORT`: Express port (defaults to `4000`).
- `CLIENT_URL`: allowed browser origin for CORS.
- `APPOINTMENT_UTC_OFFSET`: appointment timezone offset (defaults to `+05:30`).
- `VITE_API_URL`: optional frontend API base URL; defaults to `/api`.
- `VITE_TURN_URL`, `VITE_TURN_USERNAME`, `VITE_TURN_CREDENTIAL`: optional self-hosted TURN credentials supplied at frontend build time.
