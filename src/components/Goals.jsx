import { useRef, useState } from "react";
import { Line, Bar, Chart } from "react-chartjs-2";
import { LuPlus } from "react-icons/lu";
import { commonOptions, CHART_FONT } from "../charts";

// ─── Weight / Stats ──────────────────────────────────────────────────────────
function StatsSection({ state, derived, actions }) {
  const [weightInput, setWeightInput] = useState("");
  const fileInputRef = useRef(null);

  const labels = state.weightLog.map((w) => w.date.slice(5));
  const values = state.weightLog.map((w) => w.weight);
  const goalLine = labels.map(() => state.goalWeight);

  const data = {
    labels,
    datasets: [
      { label: "Weight", data: values, borderColor: "#378ADD", backgroundColor: "#378ADD", pointRadius: 3, tension: 0.3 },
      { label: "Goal", data: goalLine, borderColor: "#888780", borderDash: [5, 4], pointRadius: 0 },
    ],
  };
  const options = { ...commonOptions, scales: { y: { ticks: { font: CHART_FONT } }, x: { ticks: { font: CHART_FONT } } } };

  function handleWeighIn() {
    const n = Number(weightInput);
    if (!Number.isNaN(n) && n > 0) { actions.addWeighIn(n); setWeightInput(""); }
  }

  function handlePhotoPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => actions.addPhoto(reader.result, `Week ${state.photos.length + 1}`);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <>
      <div className="metric-grid metric-grid-3">
        <div className="metric"><p className="metric-label">Current</p><p className="metric-value">{derived.currentWeight ?? "—"} lb</p></div>
        <div className="metric"><p className="metric-label">Change</p>
          <p className="metric-value" style={{ color: derived.weightChange <= 0 ? "var(--success)" : "var(--text)" }}>
            {derived.weightChange != null ? `${derived.weightChange > 0 ? "+" : ""}${derived.weightChange} lb` : "—"}
          </p>
        </div>
        <div className="metric"><p className="metric-label">Goal</p><p className="metric-value">{state.goalWeight} lb</p></div>
      </div>

      <div className="card">
        <p className="card-title">Weight</p>
        <div className="legend-row">
          <span><span className="swatch" style={{ background: "#378ADD" }} />Weight</span>
          <span><span className="swatch dashed" />Goal</span>
        </div>
        <div className="chart-wrap" style={{ height: 160 }}>
          <Line data={data} options={options} aria-label="Weight over time" role="img" />
        </div>
        <div className="inline-form" style={{ marginTop: 10 }}>
          <input type="number" step="0.1" placeholder="Today's weight (lb)" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} />
          <button className="btn-small" onClick={handleWeighIn}>Log</button>
        </div>
      </div>

      <div className="card">
        <p className="card-title">Progress photos</p>
        <div className="photo-grid">
          {state.photos.map((p) => (
            <div className="photo-slot" key={p.id}>
              <img src={p.dataUrl} alt={p.label} />
              <p className="muted tiny">{p.label}</p>
            </div>
          ))}
          <button className="photo-slot photo-add" onClick={() => fileInputRef.current?.click()}>
            <LuPlus aria-hidden="true" style={{ fontSize: 18 }} />
            <p className="muted tiny">Add</p>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoPick} />
        </div>
      </div>
    </>
  );
}

// ─── Steps ───────────────────────────────────────────────────────────────────
function StepsSection({ state, derived, actions, helpers }) {
  const [stepsInput, setStepsInput] = useState(derived.todaySteps || "");
  const [cardioName, setCardioName] = useState("");
  const [cardioMinutes, setCardioMinutes] = useState(20);

  const { labels, values } = helpers.lastNDays(state.stepsLog, 7, 0);
  const pct = Math.min(100, Math.round((derived.todaySteps / state.stepGoal) * 100));

  const data = { labels, datasets: [{ label: "Steps", data: values, backgroundColor: "#378ADD" }] };
  const options = { ...commonOptions, scales: { y: { min: 0, max: 12000, ticks: { font: CHART_FONT, callback: (v) => v.toLocaleString() } }, x: { ticks: { font: CHART_FONT } } } };

  function handleLogSteps() {
    const n = Number(stepsInput);
    if (!Number.isNaN(n) && n >= 0) actions.logSteps(n);
  }
  function handleLogCardio() {
    if (!cardioName.trim()) return;
    actions.addCardio(cardioName.trim(), Number(cardioMinutes) || 0);
    setCardioName("");
  }

  return (
    <>
      <div className="card">
        <p className="card-title">Steps</p>
        <div className="row-between" style={{ marginBottom: 6 }}>
          <span className="muted small">{derived.todaySteps.toLocaleString()} / {state.stepGoal.toLocaleString()} today</span>
          <span className="muted small">{pct}%</span>
        </div>
        <div className="bar-track">
          <div className="bar-fill blue" style={{ width: `${pct}%` }} />
        </div>
        <div className="inline-form" style={{ marginTop: 8 }}>
          <input type="number" min="0" placeholder="Log today's steps" value={stepsInput} onChange={(e) => setStepsInput(e.target.value)} />
          <button className="btn-small" onClick={handleLogSteps}>Log</button>
        </div>
        <div className="chart-wrap" style={{ height: 120, marginTop: 10 }}>
          <Bar data={data} options={options} aria-label="Steps this week" role="img" />
        </div>
      </div>

      <div className="card">
        <p className="card-title">Cardio log</p>
        {state.cardioLog.slice(0, 5).map((c) => (
          <div className="quest-row" key={c.id}>
            <span className="quest-label">{c.name}</span>
            <span className="muted small">{c.minutes} min</span>
          </div>
        ))}
        <div className="inline-form" style={{ marginTop: 8 }}>
          <input placeholder="Activity" value={cardioName} onChange={(e) => setCardioName(e.target.value)} />
          <input type="number" min="0" style={{ width: 60 }} value={cardioMinutes} onChange={(e) => setCardioMinutes(e.target.value)} />
          <button className="btn-small" onClick={handleLogCardio}>Log</button>
        </div>
      </div>
    </>
  );
}

// ─── Sleep ────────────────────────────────────────────────────────────────────
function SleepSection({ state, derived, actions, helpers }) {
  const [hoursInput, setHoursInput] = useState(derived.todaySleep ?? "");

  const { labels, values } = helpers.lastNDays(state.sleepLog, 7, null);
  const goalLine = labels.map(() => state.sleepGoal);
  const underGoal = Math.max(0, Math.round((state.sleepGoal - derived.avgSleep) * 60));

  const data = {
    labels,
    datasets: [
      { type: "bar", label: "Hours slept", data: values, backgroundColor: "#7F77DD" },
      { type: "line", label: "Goal", data: goalLine, borderColor: "#888780", borderDash: [5, 4], pointRadius: 0 },
    ],
  };
  const options = { ...commonOptions, scales: { y: { min: 4, max: 9, ticks: { font: CHART_FONT } }, x: { ticks: { font: CHART_FONT } } } };

  function handleLog() {
    const n = Number(hoursInput);
    if (!Number.isNaN(n) && n >= 0) actions.logSleep(n);
  }

  return (
    <div className="card">
      <p className="card-title">Sleep</p>
      <div className="metric-grid metric-grid-3" style={{ marginBottom: 10 }}>
        <div className="metric"><p className="metric-label">Last night</p><p className="metric-value">{derived.todaySleep != null ? `${derived.todaySleep}h` : "—"}</p></div>
        <div className="metric"><p className="metric-label">Goal</p><p className="metric-value">{state.sleepGoal}h</p></div>
        <div className="metric"><p className="metric-label">Avg</p><p className="metric-value">{derived.avgSleep}h</p></div>
      </div>
      <div className="legend-row">
        <span><span className="swatch" style={{ background: "#7F77DD" }} />Slept</span>
        <span><span className="swatch dashed" />Goal</span>
      </div>
      <div className="chart-wrap" style={{ height: 120 }}>
        <Chart type="bar" data={data} options={options} aria-label="Sleep this week" role="img" />
      </div>
      {underGoal > 0 && (
        <p className="muted tiny" style={{ marginTop: 8 }}>Averaging {underGoal} min under goal this week.</p>
      )}
      <div className="inline-form" style={{ marginTop: 8 }}>
        <input type="number" step="0.5" min="0" placeholder="Hours slept last night" value={hoursInput} onChange={(e) => setHoursInput(e.target.value)} />
        <button className="btn-small" onClick={handleLog}>Log</button>
      </div>
    </div>
  );
}

// ─── Main Goals tab ───────────────────────────────────────────────────────────
export default function Goals({ state, derived, actions, helpers }) {
  const g = state.weightLossGoal;

  return (
    <div className="panel">
      {g && (
        <div className="metric-grid" style={{ marginBottom: -4 }}>
          <div className="metric"><p className="metric-label">Calories</p><p className="metric-value">{g.calorieGoal.toLocaleString()}</p></div>
          <div className="metric"><p className="metric-label">Protein</p><p className="metric-value">{g.proteinG}g</p></div>
          <div className="metric"><p className="metric-label">Carbs</p><p className="metric-value">{g.carbsG}g</p></div>
          <div className="metric"><p className="metric-label">Fat</p><p className="metric-value">{g.fatG}g</p></div>
        </div>
      )}
      <StatsSection state={state} derived={derived} actions={actions} />
      <StepsSection state={state} derived={derived} actions={actions} helpers={helpers} />
      <SleepSection state={state} derived={derived} actions={actions} helpers={helpers} />
    </div>
  );
}
