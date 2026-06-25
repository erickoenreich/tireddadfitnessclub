import { useState, useEffect, useCallback, useMemo } from "react";
import { computeWeightLossTargets, wasWorkoutPrescribed } from "../data/goals";
import { parseFoodList } from "../data/foods";

const STORAGE_KEY = "tdfc_state_v1";

// Days of 100% adherence in a row before a free meal gets unlocked.
const FREE_MEAL_STREAK_TARGET = 6;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoStr(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// Simple progressive XP curve: level 1 needs 300xp, level 2 needs 450 more, etc.
export function levelFromXp(xp) {
  let level = 1;
  let remaining = xp;
  let threshold = 300;
  while (remaining >= threshold) {
    remaining -= threshold;
    level += 1;
    threshold += 150;
  }
  return { level, xpIntoLevel: remaining, xpForNextLevel: threshold };
}

const RANK_TITLES = [
  "Rookie dad", "Weekend warrior", "Steady grinder", "Iron dad",
  "Quest champion", "Legend in the making", "Tired dad legend",
];
export function rankTitle(level) {
  return RANK_TITLES[Math.min(level - 1, RANK_TITLES.length - 1)];
}

function defaultState() {
  const stepsLog = {};
  const sampleSteps = [7200, 9100, 6200, 8800, 11000, 9400, 8400];
  sampleSteps.forEach((v, i) => { stepsLog[daysAgoStr(6 - i)] = v; });

  const sleepLog = {};
  const sampleSleep = [6.2, 7.0, 5.5, 6.8, 7.2, 6.9, 6.5];
  sampleSleep.forEach((v, i) => { sleepLog[daysAgoStr(6 - i)] = v; });

  const weightLog = [215, 212, 210, 207, 205, 203, 201, 200, 199, 198].map((w, i) => ({
    date: daysAgoStr(63 - i * 7),
    weight: w,
  }));

  return {
    xp: 2450,
    streak: 12,
    lastActiveDate: todayStr(),
    goalWeight: 190,
    stepGoal: 10000,
    sleepGoal: 7.5,
    quests: [
      { id: "breakfast", label: "Log breakfast", xpReward: 50, done: true },
      { id: "workout", label: "Complete a workout", xpReward: 150, done: false },
      { id: "steps", label: "Hit 10,000 steps", xpReward: 40, done: false },
      { id: "weighin", label: "Weigh in", xpReward: 25, done: false },
    ],
    weightLog,
    stepsLog,
    sleepLog,
    cardioLog: [
      { id: "c1", name: "Morning walk with stroller", minutes: 22, date: daysAgoStr(1) },
      { id: "c2", name: "Bike ride with kids", minutes: 35, date: daysAgoStr(3) },
    ],
    photos: [],
    // The app's one and only goal. Null until the user enters their
    // bodyweight on the Goals tab and we calculate their starting targets.
    weightLossGoal: null,
    // Accountability check-in history, keyed by the date being reviewed.
    dailyCheckins: {},
    pendingCheckin: null,
    dietStreak: 0,
    freeMealsEarned: 0,
    pendingFreeMeal: false,
    // Coach chat — message history persisted across sessions.
    // Each message: { role: "user"|"assistant", content: string, ts: number }
    chatMessages: [],
    // First name collected during conversational onboarding.
    userName: null,
    // Tracks whether the check-in question has already been injected into
    // chat today so we don't repeat it on every page load.
    lastCheckinAskDate: null,
    // Oura Ring integration
    ouraAccessToken: null,
    ouraRefreshToken: null,
    ouraData: null,
  };
}

// Rolls quests over, updates the streak, and queues a check-in about the
// last day the app was open, when a new day has started. Applied
// synchronously while loading state (not in an effect) so the very first
// render already reflects today, instead of flashing yesterday's data.
function rollOverDay(s) {
  const today = todayStr();
  if (s.lastActiveDate === today) return s;
  const wasYesterday = s.lastActiveDate === daysAgoStr(1);
  const dayToReview = s.lastActiveDate;
  const alreadyReviewed = !!s.dailyCheckins[dayToReview];

  let pendingCheckin = s.pendingCheckin;
  if (s.weightLossGoal && !alreadyReviewed) {
    const workoutQuest = s.quests.find((q) => q.id === "workout");
    pendingCheckin = {
      date: dayToReview,
      workoutPrescribed: wasWorkoutPrescribed(dayToReview, s.weightLossGoal.trainingDaysPerWeek),
      workoutDone: !!workoutQuest?.done,
    };
  }

  return {
    ...s,
    lastActiveDate: today,
    streak: wasYesterday ? s.streak + 1 : 1,
    quests: s.quests.map((q) => ({ ...q, done: false })),
    pendingCheckin,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return rollOverDay({ ...defaultState(), ...parsed });
  } catch {
    return defaultState();
  }
}

export function useAppState() {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addXp = useCallback((amount) => {
    setState((s) => ({ ...s, xp: s.xp + amount }));
  }, []);

  const completeQuest = useCallback((id) => {
    setState((s) => {
      const quest = s.quests.find((q) => q.id === id);
      if (!quest || quest.done) return s;
      return {
        ...s,
        xp: s.xp + quest.xpReward,
        quests: s.quests.map((q) => (q.id === id ? { ...q, done: true } : q)),
      };
    });
  }, []);

  const addWeighIn = useCallback((weight) => {
    setState((s) => {
      const today = todayStr();
      const rest = s.weightLog.filter((w) => w.date !== today);
      return { ...s, weightLog: [...rest, { date: today, weight }] };
    });
    completeQuest("weighin");
  }, [completeQuest]);

  const setGoalWeight = useCallback((goalWeight) => {
    setState((s) => ({ ...s, goalWeight }));
  }, []);

  // form: { bodyweightLb, goalWeightLb?, trainingDaysPerWeek, likedFoodsText, avoidFoodsText, equipment, mealsPerDay }
  // goalWeightLb is optional — falls back to s.goalWeight if omitted.
  const setWeightLossGoal = useCallback((form) => {
    setState((s) => {
      const isFirstTime = !s.weightLossGoal;
      const goalWeight = form.goalWeightLb ?? s.goalWeight;
      const targets = computeWeightLossTargets(form.bodyweightLb, goalWeight);
      return {
        ...s,
        goalWeight,
        weightLossGoal: {
          ...targets,
          bodyweightLb: form.bodyweightLb,
          trainingDaysPerWeek: form.trainingDaysPerWeek,
          likedFoods: parseFoodList(form.likedFoodsText),
          avoidFoods: parseFoodList(form.avoidFoodsText),
          equipment: form.equipment,
          mealsPerDay: form.mealsPerDay,
        },
        xp: isFirstTime ? s.xp + 30 : s.xp,
      };
    });
  }, []);

  const logSteps = useCallback((steps) => {
    setState((s) => ({ ...s, stepsLog: { ...s.stepsLog, [todayStr()]: steps } }));
    if (steps >= 10000) completeQuest("steps");
  }, [completeQuest]);

  const logSleep = useCallback((hours) => {
    setState((s) => ({ ...s, sleepLog: { ...s.sleepLog, [todayStr()]: hours } }));
  }, []);

  const addCardio = useCallback((name, minutes) => {
    setState((s) => ({
      ...s,
      cardioLog: [{ id: `c${Date.now()}`, name, minutes, date: todayStr() }, ...s.cardioLog],
    }));
    addXp(20);
  }, [addXp]);

  const addPhoto = useCallback((dataUrl, label) => {
    setState((s) => ({
      ...s,
      photos: [...s.photos, { id: `p${Date.now()}`, dataUrl, label, date: todayStr() }],
    }));
  }, []);

  const completeWorkout = useCallback((xpEarned) => {
    addXp(xpEarned);
    completeQuest("workout");
  }, [addXp, completeQuest]);

  // answers: { workoutDone: bool|null, hitCalorieGoal: bool }
  const submitCheckin = useCallback((answers) => {
    setState((s) => {
      if (!s.pendingCheckin) return s;
      const { date, workoutPrescribed } = s.pendingCheckin;
      const workoutDone = workoutPrescribed ? !!answers.workoutDone : true;
      const hitCalorieGoal = !!answers.hitCalorieGoal;
      const fullyAdherent = workoutDone && hitCalorieGoal;
      const newStreak = fullyAdherent ? s.dietStreak + 1 : 0;
      const earnedFreeMeal = newStreak >= FREE_MEAL_STREAK_TARGET;

      return {
        ...s,
        xp: s.xp + 20,
        dailyCheckins: {
          ...s.dailyCheckins,
          [date]: { date, workoutPrescribed, workoutDone, hitCalorieGoal, fullyAdherent },
        },
        dietStreak: earnedFreeMeal ? 0 : newStreak,
        freeMealsEarned: earnedFreeMeal ? s.freeMealsEarned + 1 : s.freeMealsEarned,
        pendingFreeMeal: earnedFreeMeal ? true : s.pendingFreeMeal,
        pendingCheckin: null,
      };
    });
  }, []);

  const acknowledgeFreeMeal = useCallback(() => {
    setState((s) => ({ ...s, pendingFreeMeal: false }));
  }, []);

  // Add a single message to the coach chat thread.
  const addChatMessage = useCallback((msg) => {
    setState((s) => ({
      ...s,
      chatMessages: [...s.chatMessages, { ...msg, ts: Date.now() }],
    }));
  }, []);

  // Clear chat history so the opening message replays on next Coach mount.
  const clearChat = useCallback(() => {
    setState((s) => ({ ...s, chatMessages: [], lastCheckinAskDate: null }));
  }, []);

  // Replace the entire chat history (used for injecting check-in messages).
  const setChatMessages = useCallback((msgs) => {
    setState((s) => ({ ...s, chatMessages: msgs }));
  }, []);

  const setUserName = useCallback((name) => {
    setState((s) => ({ ...s, userName: name }));
  }, []);

  const markCheckinAsked = useCallback(() => {
    setState((s) => ({ ...s, lastCheckinAskDate: todayStr() }));
  }, []);

  const setOuraTokens = useCallback((accessToken, refreshToken) => {
    setState((s) => ({ ...s, ouraAccessToken: accessToken, ouraRefreshToken: refreshToken }));
  }, []);

  const setOuraData = useCallback((data) => {
    setState((s) => ({ ...s, ouraData: data }));
  }, []);

  // Adjust nutrition plan — can change calories and/or meals per day.
  const updateNutrition = useCallback((calorieAdjustment, mealsPerDay) => {
    setState((s) => {
      if (!s.weightLossGoal) return s;
      const newCals = Math.max(1200, s.weightLossGoal.calorieGoal + (calorieAdjustment || 0));
      const gw = s.goalWeight;
      const proteinG = Math.round(gw * 1.25);
      const carbsG = Math.round(newCals / 10);
      const fatG = Math.round(Math.max(0, newCals - proteinG * 4 - carbsG * 4) / 9 * 10) / 10;
      return {
        ...s,
        weightLossGoal: {
          ...s.weightLossGoal,
          calorieGoal: Math.round(newCals),
          proteinG,
          carbsG,
          fatG,
          ...(mealsPerDay ? { mealsPerDay } : {}),
        },
      };
    });
  }, []);

  // Adjust training plan — can change days per week and/or equipment.
  const updateTraining = useCallback((trainingDaysPerWeek, equipment) => {
    setState((s) => {
      if (!s.weightLossGoal) return s;
      return {
        ...s,
        weightLossGoal: {
          ...s.weightLossGoal,
          ...(trainingDaysPerWeek != null ? { trainingDaysPerWeek } : {}),
          ...(equipment ? { equipment } : {}),
        },
      };
    });
  }, []);

  const lastNDays = useCallback((log, n, fallback = 0) => {
    const labels = [];
    const values = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = daysAgoStr(i);
      labels.push(d.slice(5));
      values.push(log[d] ?? fallback);
    }
    return { labels, values };
  }, []);

  const derived = useMemo(() => {
    const { level, xpIntoLevel, xpForNextLevel } = levelFromXp(state.xp);
    const todaySteps = state.stepsLog[todayStr()] ?? 0;
    const todaySleep = state.sleepLog[todayStr()] ?? null;
    const last7Sleep = lastNDays(state.sleepLog, 7, null);
    const avgSleep =
      last7Sleep.values.filter((v) => v != null).reduce((a, b) => a + b, 0) /
      (last7Sleep.values.filter((v) => v != null).length || 1);
    const currentWeight = state.weightLog[state.weightLog.length - 1]?.weight ?? null;
    const startWeight = state.weightLog[0]?.weight ?? currentWeight;
    return {
      level,
      xpIntoLevel,
      xpForNextLevel,
      rank: rankTitle(level),
      todaySteps,
      todaySleep,
      avgSleep: Math.round(avgSleep * 10) / 10,
      currentWeight,
      weightChange: currentWeight != null && startWeight != null ? currentWeight - startWeight : null,
      freeMealStreakTarget: FREE_MEAL_STREAK_TARGET,
    };
  }, [state, lastNDays]);

  return {
    state,
    derived,
    actions: {
      addXp,
      completeQuest,
      addWeighIn,
      setGoalWeight,
      setWeightLossGoal,
      logSteps,
      logSleep,
      addCardio,
      addPhoto,
      completeWorkout,
      submitCheckin,
      acknowledgeFreeMeal,
      addChatMessage,
      setChatMessages,
      clearChat,
      setUserName,
      markCheckinAsked,
      updateNutrition,
      updateTraining,
      setOuraTokens,
      setOuraData,
    },
    helpers: { lastNDays, todayStr, daysAgoStr },
  };
}
