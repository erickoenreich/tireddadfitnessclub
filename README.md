# Tired Dad Fitness Club

A gamified fitness app for dads. Meal plan generator, workout generator, weigh-in tracking, step/cardio tracking, sleep tracking, progress photos, and an XP/quest system — all running and working right now, no backend required.

## Run it

```bash
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`). Resize your browser narrow, or open it on your phone, to see it as it's meant to look.

## What's real vs. what's stubbed

**Fully working right now, for free, with no accounts or API keys:**

- Meal plan generator — rule-based, picks from a curated food database (`src/data/foods.js`) by calorie goal, diet preference, and schedule. No AI API calls, so it costs nothing to run.
- Workout generator — same idea, rule-based against an exercise database (`src/data/exercises.js`) filtered by equipment, time, and focus.
- XP, levels, streaks, and daily quests — completing a workout or weighing in awards real XP and ticks off quests.
- Weigh-in tracking with a real line chart, step tracking with a real bar chart, sleep tracking with a real chart and goal line.
- Progress photos — pick a photo from your device and it shows up in the grid (stored locally in your browser).
- Everything persists in your browser's local storage, so closing and reopening the app keeps your data.

**Stubbed for now (next layers to add):**

- The "push notification" on the home screen is a static visual preview, not a real push. The daily accountability check-in (morning-after workout/calorie assessment, see `src/components/DailyCheckin.jsx`) is real and functional, but only fires when the user actually opens the app on a new day -- it can't yet remind someone who *never* opens the app. That needs: (1) real accounts/cloud sync below, so a server can see each user's `lastActiveDate`, and (2) a scheduled Firebase Cloud Function (daily timer) that checks for anyone who hasn't checked in and sends them a push via Firebase Cloud Messaging (free) to their registered device token. Native permission prompts + token registration come once this is wrapped as a real app via Capacitor.
- There's no login or cloud sync yet — everything lives in this one browser/device. Adding real accounts means wiring up Firebase Auth + Firestore (also free at this scale).
- The paywall screen is a visual mockup of the subscription plans — it doesn't take real payment. Real subscriptions on iOS require Apple's in-app purchase system (StoreKit), not a generic payment processor like Stripe, since Apple requires digital subscriptions consumed in-app to go through their billing. RevenueCat is the standard tool for managing that across iOS/Android with one codebase, and it's free up to a reasonable revenue threshold.

## Turning this into an iOS/Android app

Capacitor is already installed. Once you're ready to test it as a real app on a phone:

```bash
npm run build
npx cap add ios       # requires a Mac with Xcode installed
npx cap add android    # requires Android Studio
npx cap sync
```

Then open the generated `ios/` project in Xcode (or `android/` in Android Studio) to run it on a simulator or real device, and eventually submit it to the App Store / Google Play.

## Project structure

```
src/
  data/
    exercises.js     exercise database + generateWorkout()
    foods.js          food database + generateMealPlan()
  state/
    useAppState.js    all app state, XP logic, persistence (localStorage)
  components/          one component per screen, plus shared header/nav/paywall
  charts.js            Chart.js setup
  App.jsx              ties screens + navigation together
  App.css              all styling
```

## Suggested next steps

1. Play with it, tweak the food/exercise databases to match your own preferences, adjust the XP curve and quest list in `src/state/useAppState.js`.
2. Set up a free Firebase project for real accounts, cloud sync, and push notifications.
3. Set up RevenueCat + App Store Connect / Google Play Console for real subscriptions.
4. Wrap with Capacitor and get it running on an actual phone.
