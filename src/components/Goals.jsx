import { useState } from "react";
import OuraConnect from "./OuraConnect";
import { computeWeightLossTargets } from "../data/goals";
import { generateMealPlan, parseFoodList, MEALS_PER_DAY_OPTIONS } from "../data/foods";
import { EQUIPMENT_OPTIONS } from "../data/exercises";
import MealList from "./MealList";

const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

function buildPlan(goal) {
  return generateMealPlan({
    calorieGoal: goal.calorieGoal,
    diet: "high-protein",
    schedule: "quick",
    avoid: goal.avoidFoods ?? [],
    prefer: goal.likedFoods ?? [],
    mealsPerDay: goal.mealsPerDay ?? 4,
  });
}

export default function Goals({ state, derived, actions, onboarding = false, onComplete }) {
  const existing = state.weightLossGoal;
  const [bodyweight, setBodyweight] = useState(existing?.bodyweightLb ?? derived.currentWeight ?? "");
  const [trainingDays, setTrainingDays] = useState(existing?.trainingDaysPerWeek ?? 4);
  const [likedText, setLikedText] = useState((existing?.likedFoods ?? []).join(", "));
  const [avoidText, setAvoidText] = useState((existing?.avoidFoods ?? []).join(", "));
  const [equipment, setEquipment] = useState(existing?.equipment ?? ["bodyweight", "dumbbells"]);
  const [mealsPerDay, setMealsPerDay] = useState(existing?.mealsPerDay ?? 4);
  const [result, setResult] = useState(() => (existing ? { targets: existing, mealPlan: buildPlan(existing) } : null));
  const [saved, setSaved] = useState(false);
  const [touched, setTouched] = useState(false);

  const bodyweightValid = Number(bodyweight) > 0;

  function toggleEquipment(value) {
    setEquipment((prev) => (prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]));
  }

  function handleSave() {
    setTouched(true);
    if (!bodyweightValid) return;

    const form = {
      bodyweightLb: Number(bodyweight) || 0,
      trainingDaysPerWeek: Number(trainingDays),
      likedFoodsText: likedText,
      avoidFoodsText: avoidText,
      equipment,
      mealsPerDay: Number(mealsPerDay),
    };
    actions.setWeightLossGoal(form);

    const targets = {
      ...computeWeightLossTargets(form.bodyweightLb, state.goalWeight),
      trainingDaysPerWeek: form.trainingDaysPerWeek,
      likedFoods: parseFoodList(likedText),
      avoidFoods: parseFoodList(avoidText),
      equipment,
      mealsPerDay: form.mealsPerDay,
    };
    setResult({ targets, mealPlan: buildPlan(targets) });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    onComplete?.();
  }

  return (
    <div className="panel">
      <div className="card">
        <p className="card-title">{onboarding ? "Welcome — let's set up your plan" : "Your goal: lose weight"}</p>
        <p className="muted small" style={{ margin: "0 0 10px" }}>
          {onboarding
            ? "This app has one goal: weight loss. Fill this out to unlock the rest of the app — it only takes a minute."
            : "That's the only goal this app is built around. Update your numbers any time."}
        </p>

        <label className="field-label">Current bodyweight (lb)</label>
        <input type="number" min="0" placeholder="e.g. 200" value={bodyweight} onChange={(e) => setBodyweight(e.target.value)} />
        {touched && !bodyweightValid && (
          <p className="tiny" style={{ color: "var(--amber)", margin: "4px 0 0" }}>Enter your bodyweight to continue.</p>
        )}

        <label className="field-label" style={{ marginTop: 10 }}>Days per week you want to train</label>
        <select value={trainingDays} onChange={(e) => setTrainingDays(e.target.value)}>
          {DAY_OPTIONS.map((d) => <option key={d} value={d}>{d} day{d > 1 ? "s" : ""} / week</option>)}
        </select>

        <label className="field-label" style={{ marginTop: 10 }}>Meals per day</label>
        <select value={mealsPerDay} onChange={(e) => setMealsPerDay(e.target.value)}>
          {MEALS_PER_DAY_OPTIONS.map((n) => <option key={n} value={n}>{n} meals/day</option>)}
        </select>
        <p className="muted tiny" style={{ margin: "4px 0 0" }}>Some guys like to eat more frequently — same daily calories, split across more, smaller meals.</p>

        <label className="field-label" style={{ marginTop: 10 }}>Foods you like</label>
        <input placeholder="e.g. chicken, rice, eggs, salmon" value={likedText} onChange={(e) => setLikedText(e.target.value)} />

        <label className="field-label" style={{ marginTop: 10 }}>Foods you avoid or hate</label>
        <input placeholder="e.g. mushrooms, seafood, tofu" value={avoidText} onChange={(e) => setAvoidText(e.target.value)} />

        <label className="field-label" style={{ marginTop: 10 }}>Equipment available to you</label>
        <div className="chip-row">
          {EQUIPMENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={"chip" + (equipment.includes(opt.value) ? " active" : "")}
              onClick={() => toggleEquipment(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button className="btn-primary" style={{ width: "100%", marginTop: 12 }} onClick={handleSave}>
          {saved ? "Saved, +30 xp" : "Calculate my plan"}
        </button>
      </div>

      {result && (
        <>
          <div className="card">
            <p className="card-title">Your daily targets</p>
            <div className="metric-grid">
              <div className="metric"><p className="metric-label">Calories</p><p className="metric-value">{result.targets.calorieGoal.toLocaleString()}</p></div>
              <div className="metric"><p className="metric-label">Protein</p><p className="metric-value">{result.targets.proteinG}g</p></div>
              <div className="metric"><p className="metric-label">Carbs</p><p className="metric-value">{result.targets.carbsG}g</p></div>
              <div className="metric"><p className="metric-label">Fat</p><p className="metric-value">{result.targets.fatG}g</p></div>
            </div>
            <p className="muted tiny" style={{ marginTop: 8 }}>
              10 cal per lb of bodyweight · 1g/lb protein · 1g/lb carbs · rest as fat
            </p>
          </div>

          <div className="card">
            <p className="card-title">Your starting plan</p>
            <MealList meals={result.mealPlan.meals} />
          </div>
        </>
      )}
      <OuraConnect state={state} actions={actions} />
    </div>
  );
}
