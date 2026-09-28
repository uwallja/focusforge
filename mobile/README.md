# FocusForge Mobile App

The active FocusForge app is built with Expo SDK 57, React Native 0.86, Expo Router, NativeWind, and TypeScript. It runs on web and can be launched on Android or iOS with the appropriate development environment.

## Quick start

From this directory:

```sh
npm ci
npm run web -- --port 8081
```

Open `http://localhost:8081` in a browser. To use Expo's native development server, run `npm start` and select a target, or use `npm run android` / `npm run ios`. Native simulator requirements depend on your operating system; iOS simulator builds require macOS and Xcode.

## Main features

- Dashboard with study statistics, level and XP progress, deadlines, goals, and a quick-start action.
- Focus and break timer with start, pause, reset, and session tracking.
- Courses with assignment details, due dates, priorities, completion, editing, and deletion. The course sheet places the existing assignment list before the editor and scrolls on small screens.
- Progress view with streaks, statistics, and achievements.
- Settings for profile name, notifications, theme, and premium demo flows.

The app uses a phone-first layout. Use the bottom tabs to move between Dashboard, Timer, Courses, Progress, and Settings.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Start the Expo development server |
| `npm run web -- --port 8081` | Start the web app on port 8081 |
| `npm run android` | Start the app for Android |
| `npm run ios` | Start the app for iOS |
| `npm run lint` | Run Expo's lint command |
| `npm run export:web` | Export a static web build |
| `npm run build` | Start an EAS build |

Development, preview, and production EAS build scripts are also available in `package.json`.

## Data and Supabase

Profile, courses, assignments, goals, settings, and progress are persisted locally with AsyncStorage. Supabase credentials are optional for local UI development. Without both `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`, the app logs a local-only warning and uses a mock Supabase client; this does not sync data to a Supabase project.

To configure a Supabase project, add the two `EXPO_PUBLIC_...` variables to a local `.env` file in this directory. Do not commit credentials. This hackathon submission does not include Supabase credentials, database schema, or seed data; the app's local-only mode is the supported demo path.

## Purchases

Premium offerings are demo data. RevenueCat is not integrated: purchase behavior is mocked, and restore purchases currently returns no restored entitlement. Configure and test store products and entitlement restoration before offering paid subscriptions in production.

## Web icon

The Expo web favicon is `assets/images/favicon.png`. Replace that file to change the browser-tab icon; the root layout adds it to the document head on web.
