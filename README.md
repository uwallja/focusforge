# FocusForge

FocusForge is a study planner with a focus timer, course and assignment tracking, goals, progress, and achievements. The active app is the Expo project in `mobile/`.

## Run the mobile app

Requirements: Node.js and npm.

```sh
cd mobile
npm ci
npm run web -- --port 8081
```

Open `http://localhost:8081` to test the web version. To run the native development server instead, use `npm start`, then choose Android or iOS, or run `npm run android` / `npm run ios`.

More details, available scripts, data behavior, and current integration limitations are documented in [mobile/README.md](mobile/README.md).

## Repository layout

- `mobile/` — Expo SDK 57, React Native 0.86, Expo Router, NativeWind, TypeScript, and all current app screens and assets.
- `.gitignore` — Excludes local secrets, generated preview payloads, caches, and legacy/optional workspaces from the hackathon submission.

## Data and integrations

The current app persists its profile, courses, assignments, settings, goals, and progress locally with AsyncStorage. Without `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`, it starts in local-only mode and prints a warning. Supabase credentials and schema are not included in this submission; do not commit secrets.

Premium offerings are demo data. RevenueCat is not connected; purchases are mocked and restore purchases currently returns no restored entitlement. Do not enable paid production purchases until store products and entitlement handling are configured and tested.
