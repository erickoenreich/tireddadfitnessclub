// Tired Dad Fitness Club has exactly one goal: weight loss. Macro formula:
//
//   calories = current bodyweight (lb) x 10
//   protein  = goal weight (lb) x 1.25g  ← builds muscle at target weight
//   carbs    = 1g per lb of current bodyweight
//   fat      = whatever calories remain after protein + carbs
//
// Worked example: 220 lb dad aiming for 185 lb →
//   2,200 cal, 231g protein (185×1.25), 220g carbs,
//   (2200 - 231×4 - 220×4) / 9 ≈ 36g fat.
export function macrosForCalories(calorieGoal, goalWeightLb) {
  const cal = Math.max(0, Number(calorieGoal) || 0);
  // If goalWeightLb is provided use the 1.25g/lb-of-goal-weight formula,
  // otherwise fall back to the old 1g/lb-of-calories ratio (legacy).
  const proteinG = goalWeightLb
    ? Math.max(0, Number(goalWeightLb)) * 1.25
    : cal / 10;
  const carbsG = cal / 10;
  const fatG = Math.max(0, cal - proteinG * 4 - carbsG * 4) / 9;
  return { proteinG, carbsG, fatG };
}

export function computeWeightLossTargets(bodyweightLb, goalWeightLb) {
  const bw = Math.max(0, Number(bodyweightLb) || 0);
  const gw = Math.max(0, Number(goalWeightLb) || bw); // fall back to BW if goal not set
  const calorieGoal = bw * 10;
  const { proteinG, carbsG, fatG } = macrosForCalories(calorieGoal, gw);
  return {
    bodyweightLb: bw,
    calorieGoal: Math.round(calorieGoal),
    proteinG: Math.round(proteinG),
    carbsG: Math.round(carbsG),
    fatG: Math.round(fatG * 10) / 10,
  };
}

// Deterministic weekly training pattern derived purely from how many
// days/week the user wants to train (the Goals tab only asks for a count,
// not specific days). 0 = Sunday ... 6 = Saturday.
const TRAINING_PATTERNS = {
  1: [3],
  2: [1, 4],
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 4, 5],
  6: [1, 2, 3, 4, 5, 6],
  7: [0, 1, 2, 3, 4, 5, 6],
};

// Used by the morning check-in to decide whether to even ask the
// "did you train?" question for a given past date.
export function wasWorkoutPrescribed(dateStr, trainingDaysPerWeek) {
  const pattern = TRAINING_PATTERNS[trainingDaysPerWeek] || TRAINING_PATTERNS[4];
  const weekday = new Date(`${dateStr}T00:00:00`).getDay();
  return pattern.includes(weekday);
}
