# P2P Multinode App

This repository contains a full implementation of a P2P multinode platform.
It provides a complete backend API using Express/Prisma with SQLite and a React Native (Expo)
mobile application.

## Structure

- `backend` – Node.js Express API with authentication and basic routes.
- `mobile` – React Native app created with Expo and TypeScript.
- `mobile` includes authentication, product management and transaction screens with offline persistence.

## Requirements

- Node.js (v18+) and npm
- Expo CLI (`npm install -g expo-cli`)

## Usage

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm start
```

Endpoints include:
 - `POST /api/register` – create a user and return an OTP secret
 - `POST /api/login` – obtain a JWT (requires `otp` field)
 - `GET /api/me` – user info (requires `Authorization: Bearer <token>`)
- `GET /api/products` – list all products
- `POST /api/products` – create product (requires token)
- `GET /api/transactions` – list your transactions (requires token)
- `POST /api/transactions` – create a transaction (requires token)

### Mobile App

```bash
cd mobile
npm install
npm start
```

Screens include login (with OTP), register, product management and transaction history. The mobile app persists data offline using zustand, stores the JWT token with `AsyncStorage` and supports English and Spanish using `i18n-js`. It also receives real-time updates via WebSockets.

Both commands will launch the respective development servers.
