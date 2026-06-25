// Food database for the rule-based meal plan generator.
// diets: which diet preferences this item fits ('balanced' fits everything)
// quick: true if it works for "short on time" schedules
// servings: plain-language portion breakdown -- shown when a meal is tapped

export const FOODS = {
  breakfast: [
    { name: "Greek yogurt, berries, granola", calories: 420, protein: 28, carbs: 48, fat: 12, diets: ["balanced", "high-protein", "vegetarian"], quick: true,
      servings: ["1.5 cups plain Greek yogurt", "3/4 cup mixed berries", "1/3 cup granola"] },
    { name: "3-egg veggie omelet with toast", calories: 460, protein: 30, carbs: 32, fat: 22, diets: ["balanced", "high-protein"], quick: true,
      servings: ["3 whole eggs", "1/2 cup chopped peppers and spinach", "2 slices whole-grain toast"] },
    { name: "Protein oatmeal with peanut butter", calories: 520, protein: 32, carbs: 58, fat: 16, diets: ["balanced", "high-protein", "vegetarian"], quick: true,
      servings: ["1 cup rolled oats (dry)", "1 scoop protein powder", "1 tbsp peanut butter"] },
    { name: "Egg white scramble with spinach and avocado", calories: 380, protein: 34, carbs: 14, fat: 20, diets: ["low-carb", "high-protein"], quick: true,
      servings: ["1.5 cups egg whites (about 8 eggs)", "1 cup spinach", "1/2 avocado"] },
    { name: "Cottage cheese with pineapple", calories: 280, protein: 26, carbs: 28, fat: 6, diets: ["balanced", "high-protein", "low-carb", "vegetarian"], quick: true,
      servings: ["1.5 cups low-fat cottage cheese", "3/4 cup pineapple chunks"] },
    { name: "Tofu breakfast scramble", calories: 400, protein: 24, carbs: 22, fat: 20, diets: ["vegetarian", "balanced"], quick: false,
      servings: ["1 block (14 oz) firm tofu, crumbled", "1/2 cup diced vegetables", "1 tsp olive oil"] },
    { name: "Egg white power scramble with vegetables", calories: 299, protein: 32, carbs: 18, fat: 11, diets: ["balanced", "high-protein", "low-carb", "vegetarian"], quick: true,
      servings: ["2 cups egg whites (about 12 eggs)", "1 cup chopped vegetables", "1 oz reduced-fat cheese"] },
  ],
  lunch: [
    { name: "Grilled chicken bowl, rice, veggies", calories: 690, protein: 48, carbs: 70, fat: 18, diets: ["balanced", "high-protein"], quick: true,
      servings: ["8 oz grilled chicken breast", "1.5 cups cooked rice", "1 cup mixed vegetables"] },
    { name: "Turkey and avocado wrap", calories: 580, protein: 36, carbs: 50, fat: 22, diets: ["balanced"], quick: true,
      servings: ["6 oz sliced turkey breast", "1 large whole-wheat wrap", "1/2 avocado", "lettuce and tomato"] },
    { name: "Big chicken salad, olive oil dressing", calories: 520, protein: 42, carbs: 18, fat: 28, diets: ["low-carb", "high-protein"], quick: true,
      servings: ["6 oz grilled chicken", "3 cups mixed greens", "1 tbsp olive oil dressing"] },
    { name: "Lentil and quinoa bowl", calories: 560, protein: 24, carbs: 78, fat: 14, diets: ["vegetarian", "balanced"], quick: false,
      servings: ["1 cup cooked lentils", "1 cup cooked quinoa", "1/2 cup roasted vegetables"] },
    { name: "Steak and sweet potato", calories: 720, protein: 50, carbs: 56, fat: 26, diets: ["balanced", "high-protein"], quick: false,
      servings: ["8 oz sirloin steak", "1 large sweet potato", "1 cup green beans"] },
    { name: "Tuna lettuce wraps", calories: 420, protein: 40, carbs: 10, fat: 20, diets: ["low-carb", "high-protein"], quick: true,
      servings: ["2 cans (10 oz) tuna", "1 tbsp mayo or Greek yogurt", "4 large lettuce leaves"] },
    { name: "Chickpea and feta salad", calories: 540, protein: 22, carbs: 52, fat: 24, diets: ["vegetarian", "balanced"], quick: true,
      servings: ["1.5 cups chickpeas", "1/4 cup feta cheese", "2 cups chopped vegetables", "1 tbsp olive oil"] },
    { name: "Grilled chicken and vegetable power bowl", calories: 560, protein: 56, carbs: 30, fat: 24, diets: ["balanced", "high-protein", "low-carb"], quick: true,
      servings: ["10 oz grilled chicken breast", "1.5 cups mixed vegetables", "1 tbsp olive oil"] },
    { name: "Seitan stir-fry with vegetables", calories: 414, protein: 46, carbs: 26, fat: 14, diets: ["vegetarian", "balanced", "high-protein"], quick: true,
      servings: ["8 oz seitan, sliced", "1.5 cups stir-fry vegetables", "1 tbsp sesame oil"] },
  ],
  dinner: [
    { name: "Salmon, sweet potato, broccoli", calories: 730, protein: 46, carbs: 52, fat: 30, diets: ["balanced", "high-protein"], quick: false,
      servings: ["7 oz salmon fillet", "1 medium sweet potato", "1.5 cups broccoli"] },
    { name: "Ground turkey stir-fry with rice", calories: 680, protein: 44, carbs: 64, fat: 20, diets: ["balanced", "high-protein"], quick: true,
      servings: ["7 oz lean ground turkey", "1.5 cups cooked rice", "1 cup stir-fry vegetables"] },
    { name: "Grilled steak with roasted vegetables", calories: 700, protein: 48, carbs: 24, fat: 38, diets: ["low-carb", "high-protein"], quick: false,
      servings: ["8 oz ribeye or sirloin", "2 cups roasted vegetables", "1 tbsp olive oil"] },
    { name: "Baked cod with quinoa and asparagus", calories: 580, protein: 42, carbs: 48, fat: 16, diets: ["balanced", "high-protein"], quick: false,
      servings: ["8 oz cod fillet", "1 cup cooked quinoa", "1.5 cups asparagus"] },
    { name: "Chickpea curry with rice", calories: 640, protein: 20, carbs: 88, fat: 18, diets: ["vegetarian", "balanced"], quick: true,
      servings: ["1.5 cups chickpea curry", "1 cup cooked rice", "1/4 cup coconut milk"] },
    { name: "Zucchini noodles with turkey meatballs", calories: 520, protein: 40, carbs: 22, fat: 26, diets: ["low-carb", "high-protein"], quick: true,
      servings: ["2 medium zucchini, spiralized", "5 turkey meatballs (about 7 oz)", "1/2 cup marinara"] },
    { name: "Sheet-pan chicken fajitas", calories: 610, protein: 44, carbs: 46, fat: 22, diets: ["balanced", "high-protein"], quick: true,
      servings: ["7 oz chicken breast strips", "3 small tortillas", "1 cup peppers and onions"] },
    { name: "Baked chicken breast with roasted vegetables and herbs", calories: 490, protein: 58, carbs: 24, fat: 18, diets: ["balanced", "high-protein", "low-carb"], quick: true,
      servings: ["10 oz chicken breast", "2 cups roasted vegetables", "1 tbsp olive oil"] },
    { name: "Seitan and vegetable skillet", calories: 424, protein: 44, carbs: 26, fat: 16, diets: ["vegetarian", "balanced", "high-protein"], quick: true,
      servings: ["8 oz seitan, cubed", "1.5 cups mixed vegetables", "1 tbsp olive oil"] },
  ],
  snack: [
    { name: "Protein shake, almonds", calories: 340, protein: 28, carbs: 14, fat: 18, diets: ["balanced", "high-protein"], quick: true,
      servings: ["1 scoop protein powder + water or milk", "1 oz almonds (about 20)"] },
    { name: "Apple with peanut butter", calories: 280, protein: 8, carbs: 32, fat: 14, diets: ["balanced", "vegetarian"], quick: true,
      servings: ["1 medium apple", "2 tbsp peanut butter"] },
    { name: "Hard-boiled eggs and cheese", calories: 260, protein: 20, carbs: 4, fat: 18, diets: ["low-carb", "high-protein"], quick: true,
      servings: ["3 hard-boiled eggs", "1 oz cheese"] },
    { name: "Hummus with carrots", calories: 220, protein: 8, carbs: 26, fat: 10, diets: ["vegetarian", "balanced"], quick: true,
      servings: ["1/3 cup hummus", "1.5 cups carrot sticks"] },
    { name: "Cottage cheese and berries", calories: 240, protein: 22, carbs: 20, fat: 6, diets: ["balanced", "high-protein", "vegetarian"], quick: true,
      servings: ["1 cup low-fat cottage cheese", "1/2 cup berries"] },
    { name: "Egg white protein shake", calories: 162, protein: 30, carbs: 6, fat: 2, diets: ["balanced", "high-protein", "low-carb", "vegetarian"], quick: true,
      servings: ["1.5 cups egg whites, blended", "1/2 cup berries", "ice"] },
  ],
};

export const DIET_OPTIONS = [
  { value: "balanced", label: "Balanced" },
  { value: "high-protein", label: "High protein" },
  { value: "low-carb", label: "Low carb" },
  { value: "vegetarian", label: "Vegetarian" },
];

export const SCHEDULE_OPTIONS = [
  { value: "prep", label: "Meal prep Sunday" },
  { value: "quick", label: "Cook daily, short on time" },
  { value: "out", label: "Eating out often" },
];

export const MEALS_PER_DAY_OPTIONS = [3, 4, 5, 6];

const CATEGORY_LABEL = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack" };

export function mealLabel(meal) {
  const match = meal.slot.match(/-(\d+)$/);
  const base = CATEGORY_LABEL[meal.category] || meal.category;
  return match ? `${base} ${match[1]}` : base;
}

// Calorie share per meal, by how many meals/day the user wants (3-6).
// Extra meals beyond breakfast/lunch/dinner are additional snack slots --
// some guys like to eat more frequently, so we just add more, smaller hits.
const MEAL_TEMPLATES = {
  3: [
    { slot: "breakfast", category: "breakfast", share: 0.30 },
    { slot: "lunch", category: "lunch", share: 0.35 },
    { slot: "dinner", category: "dinner", share: 0.35 },
  ],
  4: [
    { slot: "breakfast", category: "breakfast", share: 0.25 },
    { slot: "lunch", category: "lunch", share: 0.30 },
    { slot: "snack", category: "snack", share: 0.10 },
    { slot: "dinner", category: "dinner", share: 0.35 },
  ],
  5: [
    { slot: "breakfast", category: "breakfast", share: 0.22 },
    { slot: "snack-1", category: "snack", share: 0.10 },
    { slot: "lunch", category: "lunch", share: 0.25 },
    { slot: "snack-2", category: "snack", share: 0.10 },
    { slot: "dinner", category: "dinner", share: 0.33 },
  ],
  6: [
    { slot: "breakfast", category: "breakfast", share: 0.20 },
    { slot: "snack-1", category: "snack", share: 0.10 },
    { slot: "lunch", category: "lunch", share: 0.22 },
    { slot: "snack-2", category: "snack", share: 0.10 },
    { slot: "dinner", category: "dinner", share: 0.28 },
    { slot: "snack-3", category: "snack", share: 0.10 },
  ],
};

// Splits a comma-separated free-text field ("chicken, rice, eggs") into clean
// lowercase keywords for matching against food names.
export function parseFoodList(text) {
  return (text || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function matchesAnyKeyword(name, keywords) {
  const lower = name.toLowerCase();
  return keywords.some((k) => k && lower.includes(k));
}

// Picks the leanest (highest protein-per-calorie) item available, after
// filtering by diet/schedule/avoid/prefer -- then generateMealPlan scales
// that exact item's serving up or down to hit the slot's calorie target.
// Always returns the single highest-density match, deterministically --
// the database includes at least one "anchor" item per category/diet
// combination dense enough (>=0.1g protein/calorie) to actually clear this
// app's protein target once scaled, so reliably hitting the number matters
// more here than day-to-day meal variety.
function pickLeanest(items, diet, requireQuick, avoid, prefer) {
  let pool = items.filter((i) => i.diets.includes(diet));
  if (pool.length === 0) pool = items.filter((i) => i.diets.includes("balanced"));
  if (requireQuick) {
    const quickPool = pool.filter((i) => i.quick);
    if (quickPool.length > 0) pool = quickPool;
  }
  // Drop anything matching a disliked/avoided keyword, unless that would
  // wipe out the whole pool -- better to serve something than nothing.
  if (avoid.length > 0) {
    const allowed = pool.filter((i) => !matchesAnyKeyword(i.name, avoid));
    if (allowed.length > 0) pool = allowed;
  }
  // Prefer liked foods when there's a match, otherwise fall back to the
  // full (already avoid-filtered) pool.
  let searchPool = pool;
  if (prefer.length > 0) {
    const liked = pool.filter((i) => matchesAnyKeyword(i.name, prefer));
    if (liked.length > 0) searchPool = liked;
  }

  return searchPool.reduce(
    (best, item) => (item.protein / item.calories > best.protein / best.calories ? item : best),
    searchPool[0]
  );
}

const WHOLE_UNIT_PATTERN = /\b(eggs?|slices?|cans?|tortillas?|meatballs?|wraps?|leaf|leaves)\b/i;

// Scales one "1.5 cups cooked rice"-style serving line by `factor`, rounding
// to whole units for discrete foods (eggs, slices, ...) and to the nearest
// quarter for everything else, so the displayed portion stays readable.
function scaleServingLine(line, factor) {
  const match = line.match(/^(\d+\s*\/\s*\d+|\d+(?:\.\d+)?)(\s.*)$/);
  if (!match) return line;
  const [, qtyStr, rest] = match;
  const qty = qtyStr.includes("/")
    ? qtyStr.split("/").map(Number).reduce((n, d) => n / d)
    : parseFloat(qtyStr);

  let scaled = qty * factor;
  scaled = WHOLE_UNIT_PATTERN.test(rest)
    ? Math.max(1, Math.round(scaled))
    : Math.max(0.25, Math.round(scaled * 4) / 4);

  const display = Number.isInteger(scaled) ? String(scaled) : scaled.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return `${display}${rest}`;
}

// Builds a one-day meal plan from a calorie goal, diet preference, and schedule.
// `avoid`/`prefer` are optional keyword arrays (see parseFoodList) used to
// filter out disliked foods and favor liked ones. `mealsPerDay` (3-6) picks
// how many eating occasions to split the calories across -- some guys like
// eating more frequently, so more meals just means more, smaller ones.
// Every slot's calorie share gets filled by scaling the leanest matching
// food's exact serving up or down to hit it precisely -- that's what keeps
// daily totals tracking the same targets regardless of meal count, instead
// of drifting based on whichever fixed-size dish happened to get picked.
// Pure rule-based selection against the food database above -- no AI/API calls,
// so it costs nothing to run. Swap this for a real LLM call later if you want
// truly personalized plans instead of curated picks.
export function generateMealPlan({ calorieGoal, diet, schedule, avoid = [], prefer = [], mealsPerDay = 4 }) {
  const requireQuick = schedule === "quick";
  const template = MEAL_TEMPLATES[mealsPerDay] || MEAL_TEMPLATES[4];
  const meals = template.map(({ slot, category, share }) => {
    const targetCalories = calorieGoal * share;
    const base = pickLeanest(FOODS[category], diet, requireQuick, avoid, prefer);
    const factor = base.calories > 0 ? targetCalories / base.calories : 1;
    const item = {
      name: base.name,
      calories: Math.round(base.calories * factor),
      protein: Math.round(base.protein * factor),
      carbs: Math.round(base.carbs * factor),
      fat: Math.round(base.fat * factor * 10) / 10,
      servings: base.servings.map((s) => scaleServingLine(s, factor)),
    };
    return { slot, category, ...item };
  });

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return { meals, totals };
}
