import { useState } from "react";
import { Bar } from "react-chartjs-2";
import { commonOptions, CHART_FONT } from "../charts";

export default function StepsTracker({ state, derived, actions, helpers }) {
  const [stepsInput, setStepsInput] = useState(derived.todaySteps || "");
  const [cardioName, setCardioName] = useState("");
  const [cardioMinutes, setCardioMinutes] = useState(20);

  const { labels, values } = helpers.lastNDays(state.stepsLog, 7, 0);
  const pct = Math.min(100, Math.round((derived.todaySteps / state.stepGoal) * 100));

  const data = {
    labels,
    datasets: [{ label: "Steps", data: values, backgroundColor: "#378ADD" }],
  };
  const options = {
    ...commonOptions,
    scales: {
      y: { min: 0, max: 12000, ticks: { font: CHART_FONT, callback: (v) => v.toLocaleString() } },
      x: { ticks: { font: CHART_FONT } },
    },
  };

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
    <div className="panel">
      <div className="metric-grid metric-grid-3">
        <div className="metric"><p className="metric-label">Steps today</p><p className="metric-value">{derived.todaySteps.toLocaleString()}</p></div>
        <div className="metric"><p className="metric-label">Goal</p><p className="metric-value">{state.stepGoal.toLocaleString()}</p></div>
        <div className="metric"><p className="metric-label">Progress</p><p className="metric-value">{pct}%</p></div>
      </div>

      <div className="card">
        <div className="row-between" style={{ marginBottom: 6 }}>
          <span className="bold small">Daily step goal</span>
          <span className="muted small">{derived.todaySteps.toLocaleString()} / {state.stepGoal.toLocaleString()}</span>
        </div>
        <div className="bar-track">
          <div className="bar-fill blue" style={{ width: `${pct}%` }} />
        </div>
        <div className="inline-form">
          <input type="number" min="0" placeholder="Log today's steps" value={stepsInput} onChange={(e) => setStepsInput(e.target.value)} />
          <button className="btn-small" onClick={handleLogSteps}>Log</button>
        </div>
      </div>

      <div className="card">
        <p className="card-title">This week</p>
        <div className="chart-wrap" style={{ height: 160 }}>
          <Bar data={data} options={options} aria-label="Bar chart of daily steps over the last 7 days" role="img" />
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
          <input placeholder="Activity (e.g. bike ride)" value={cardioName} onChange={(e) => setCardioName(e.target.value)} />
          <input type="number" min="0" style={{ width: 70 }} value={cardioMinutes} onChange={(e) => setCardioMinutes(e.target.value)} />
          <button className="btn-small" onClick={handleLogCardio}>Log</button>
        </div>
      </div>
    </div>
  );
}
