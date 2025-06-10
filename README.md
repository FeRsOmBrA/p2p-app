# P2P Multinode App (Skeleton)

This repository contains an early prototype for a P2P multinode platform.
It provides a backend API using Express/Prisma with SQLite and a simple React Native (Expo)
application. The goal is to serve as a starting point for further development.

## Structure

- `backend` – Node.js Express API with authentication and basic routes.
- `mobile` – React Native app created with Expo and TypeScript.
 - `mobile` – React Native app with simple auth and product screens.

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

Screens include login (with OTP), register (shows OTP secret), product list, add product and transactions (requires token). The mobile app stores the JWT token with `AsyncStorage` and supports English and Spanish using `i18n-js`.

Both commands will launch the respective development servers.

This project is **incomplete** and only provides a basic scaffold.
