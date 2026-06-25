import { useState } from "react";
import { generateMealPlan, DIET_OPTIONS, SCHEDULE_OPTIONS } from "../data/foods";
import MealList from "./MealList";

export default function MealPlanner({ state, actions }) {
  const goal = state.weightLossGoal;
  const [calorieGoal, setCalorieGoal] = useState(goal?.calorieGoal ?? 2600);
  const [diet, setDiet] = useState("high-protein");
  const [schedule, setSchedule] = useState("quick");
  const [plan, setPlan] = useState(() =>
    generateMealPlan({
      calorieGoal: goal?.calorieGoal ?? 2600,
      diet: "high-protein",
      schedule: "quick",
      avoid: goal?.avoidFoods ?? [],
      prefer: goal?.likedFoods ?? [],
      mealsPerDay: goal?.mealsPerDay ?? 4,
    })
  );
  const [justGenerated, setJustGenerated] = useState(false);

  function handleGenerate() {
    setPlan(generateMealPlan({
      calorieGoal,
      diet,
      schedule,
      avoid: goal?.avoidFoods ?? [],
      prefer: goal?.likedFoods ?? [],
      mealsPerDay: goal?.mealsPerDay ?? 4,
    }));
    actions.addXp(15);
    setJustGenerated(true);
    setTimeout(() => setJustGenerated(false), 1500);
  }

  return (
    <div className="panel">
      {goal && (
        <p className="muted tiny" style={{ margin: 0 }}>
          Using your saved goal: {goal.calorieGoal.toLocaleString()} cal/day, and respecting the foods you set on the Goals tab.
        </p>
      )}

      <div className="card">
        <label className="field-label">Daily calorie goal</label>
        <div className="slider-row">
          <input
            type="range" min="1800" max="3200" step="50"
            value={calorieGoal}
            onChange={(e) => setCalorieGoal(Number(e.target.value))}
          />
          <span className="slider-value">{calorieGoal.toLocaleString()}</span>
        </div>

        <label className="field-label" style={{ marginTop: 10 }}>Diet preference</label>
        <select value={diet} onChange={(e) => setDiet(e.target.value)}>
          {DIET_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>

        <label className="field-label" style={{ marginTop: 10 }}>Cooking schedule</label>
        <select value={schedule} onChange={(e) => setSchedule(e.target.value)}>
          {SCHEDULE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <button className="btn-primary" style={{ width: "100%", marginTop: 10 }} onClick={handleGenerate}>
          {justGenerated ? "Done, +15 xp" : "Generate meal plan"}
        </button>
      </div>

      <div className="metric-grid">
        <div className="metric"><p className="metric-label">Calories</p><p className="metric-value">{Math.round(plan.totals.calories).toLocaleString()}</p></div>
        <div className="metric"><p className="metric-label">Protein</p><p className="metric-value">{Math.round(plan.totals.protein)}g</p></div>
        <div className="metric"><p className="metric-label">Carbs</p><p className="metric-value">{Math.round(plan.totals.carbs)}g</p></div>
        <div className="metric"><p className="metric-label">Fat</p><p className="metric-value">{Math.round(plan.totals.fat)}g</p></div>
      </div>

      <div className="card">
        <p className="card-title">Today's plan</p>
        <MealList meals={plan.meals} />
      </div>
    </div>
  );
}
