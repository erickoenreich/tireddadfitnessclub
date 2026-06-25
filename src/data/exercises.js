// Exercise database for the rule-based workout generator.
// equipment: which equipment types this exercise can be done with (matches against user's selected equipment)
// focus: which workout focus this exercise belongs to ('full' exercises show up in every focus)
// minutes: rough time cost including rest, used to fill the user's time budget
// xp: reward for including this exercise in a generated workout

export const EXERCISES = [
  { name: "Push-ups", equipment: ["bodyweight"], focus: "upper", sets: 4, reps: "12", minutes: 5, xp: 20 },
  { name: "Pike push-ups", equipment: ["bodyweight"], focus: "upper", sets: 3, reps: "10", minutes: 5, xp: 20 },
  { name: "Tricep dips (chair)", equipment: ["bodyweight"], focus: "upper", sets: 3, reps: "12", minutes: 5, xp: 15 },
  { name: "Dumbbell rows", equipment: ["dumbbells"], focus: "upper", sets: 3, reps: "10", minutes: 6, xp: 20 },
  { name: "Dumbbell shoulder press", equipment: ["dumbbells"], focus: "upper", sets: 3, reps: "10", minutes: 6, xp: 20 },
  { name: "Dumbbell bicep curls", equipment: ["dumbbells"], focus: "upper", sets: 3, reps: "12", minutes: 5, xp: 15 },
  { name: "Band rows", equipment: ["bands"], focus: "upper", sets: 3, reps: "15", minutes: 5, xp: 15 },
  { name: "Band shoulder press", equipment: ["bands"], focus: "upper", sets: 3, reps: "15", minutes: 5, xp: 15 },
  { name: "Bench press", equipment: ["gym"], focus: "upper", sets: 4, reps: "8", minutes: 8, xp: 25 },
  { name: "Lat pulldown", equipment: ["gym"], focus: "upper", sets: 4, reps: "10", minutes: 7, xp: 25 },
  { name: "Cable rows", equipment: ["gym"], focus: "upper", sets: 3, reps: "10", minutes: 6, xp: 20 },

  { name: "Bodyweight squats", equipment: ["bodyweight"], focus: "lower", sets: 4, reps: "15", minutes: 5, xp: 20 },
  { name: "Lunges", equipment: ["bodyweight"], focus: "lower", sets: 3, reps: "12 / side", minutes: 6, xp: 20 },
  { name: "Glute bridges", equipment: ["bodyweight"], focus: "lower", sets: 3, reps: "15", minutes: 5, xp: 15 },
  { name: "Dumbbell goblet squats", equipment: ["dumbbells"], focus: "lower", sets: 4, reps: "12", minutes: 6, xp: 20 },
  { name: "Dumbbell Romanian deadlifts", equipment: ["dumbbells"], focus: "lower", sets: 3, reps: "10", minutes: 6, xp: 20 },
  { name: "Band lateral walks", equipment: ["bands"], focus: "lower", sets: 3, reps: "15 / side", minutes: 5, xp: 15 },
  { name: "Leg press", equipment: ["gym"], focus: "lower", sets: 4, reps: "10", minutes: 8, xp: 25 },
  { name: "Barbell squats", equipment: ["gym"], focus: "lower", sets: 4, reps: "8", minutes: 9, xp: 25 },
  { name: "Leg curl machine", equipment: ["gym"], focus: "lower", sets: 3, reps: "12", minutes: 6, xp: 20 },

  { name: "Plank hold", equipment: ["bodyweight"], focus: "core", sets: 3, reps: "45s", minutes: 4, xp: 15 },
  { name: "Bicycle crunches", equipment: ["bodyweight"], focus: "core", sets: 3, reps: "20", minutes: 4, xp: 15 },
  { name: "Mountain climbers", equipment: ["bodyweight"], focus: "core", sets: 3, reps: "30s", minutes: 4, xp: 15 },
  { name: "Dead bug", equipment: ["bodyweight"], focus: "core", sets: 3, reps: "12 / side", minutes: 4, xp: 15 },
  { name: "Band woodchoppers", equipment: ["bands"], focus: "core", sets: 3, reps: "12 / side", minutes: 5, xp: 15 },
  { name: "Cable crunches", equipment: ["gym"], focus: "core", sets: 3, reps: "15", minutes: 5, xp: 20 },
  { name: "Hanging knee raises", equipment: ["gym"], focus: "core", sets: 3, reps: "12", minutes: 5, xp: 20 },

  { name: "Jumping jacks", equipment: ["bodyweight"], focus: "cardio", sets: 3, reps: "45s", minutes: 4, xp: 15 },
  { name: "Burpees", equipment: ["bodyweight"], focus: "cardio", sets: 4, reps: "10", minutes: 6, xp: 25 },
  { name: "High knees", equipment: ["bodyweight"], focus: "cardio", sets: 3, reps: "40s", minutes: 4, xp: 15 },
  { name: "Kettlebell / dumbbell swings", equipment: ["dumbbells"], focus: "cardio", sets: 4, reps: "15", minutes: 6, xp: 20 },
  { name: "Rowing machine intervals", equipment: ["gym"], focus: "cardio", sets: 5, reps: "1 min on / 1 min off", minutes: 12, xp: 30 },
  { name: "Treadmill intervals", equipment: ["gym"], focus: "cardio", sets: 6, reps: "1 min on / 1 min off", minutes: 14, xp: 30 },
];

export const FOCUS_OPTIONS = [
  { value: "full", label: "Full body" },
  { value: "upper", label: "Upper body" },
  { value: "lower", label: "Lower body" },
  { value: "core", label: "Core and cardio" },
];

export const EQUIPMENT_OPTIONS = [
  { value: "bodyweight", label: "Bodyweight" },
  { value: "dumbbells", label: "Dumbbells" },
  { value: "bands", label: "Resistance bands" },
  { value: "gym", label: "Full gym" },
];

// Builds a workout from available equipment + time budget + focus.
// Pure rule-based selection -- no AI/API calls, so it costs nothing to run.
export function generateWorkout({ equipment, minutes, focus }) {
  const focuses = focus === "core" ? ["core", "cardio"] : [focus];
  let pool = EXERCISES.filter(
    (ex) => ex.equipment.some((e) => equipment.includes(e)) && focuses.includes(ex.focus)
  );

  // Full body pulls a mix across all focuses if "full" selected
  if (focus === "full") {
    pool = EXERCISES.filter((ex) => ex.equipment.some((e) => equipment.includes(e)));
  }

  if (pool.length === 0) {
    return { exercises: [], totalMinutes: 0, totalXp: 0, name: "No matching exercises" };
  }

  // Shuffle deterministically-ish by sorting on a cheap pseudo-random key so
  // repeated generations vary, then greedily fill the time budget.
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const picked = [];
  let timeUsed = 0;
  for (const ex of shuffled) {
    if (timeUsed + ex.minutes > minutes && picked.length > 0) continue;
    picked.push(ex);
    timeUsed += ex.minutes;
    if (timeUsed >= minutes) break;
  }

  const totalXp = picked.reduce((sum, ex) => sum + ex.xp, 0);
  const names = {
    full: "Full body session",
    upper: "Upper body blast",
    lower: "Lower body burner",
    core: "Core and cardio circuit",
  };

  return { exercises: picked, totalMinutes: timeUsed, totalXp, name: names[focus] || "Workout" };
}
