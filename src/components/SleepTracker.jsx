import { useState } from "react";
import { Chart } from "react-chartjs-2";
import { commonOptions, CHART_FONT } from "../charts";

export default function SleepTracker({ state, derived, actions, helpers }) {
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
  const options = {
    ...commonOptions,
    scales: {
      y: { min: 4, max: 9, ticks: { font: CHART_FONT } },
      x: { ticks: { font: CHART_FONT } },
    },
  };

  function handleLog() {
    const n = Number(hoursInput);
    if (!Number.isNaN(n) && n >= 0) actions.logSleep(n);
  }

  return (
    <div className="panel">
      <div className="metric-grid metric-grid-3">
        <div className="metric"><p className="metric-label">Last night</p><p className="metric-value">{derived.todaySleep != null ? `${derived.todaySleep} hrs` : "—"}</p></div>
        <div className="metric"><p className="metric-label">Goal</p><p className="metric-value">{state.sleepGoal} hrs</p></div>
        <div className="metric"><p className="metric-label">Week avg</p><p className="metric-value">{derived.avgSleep} hrs</p></div>
      </div>

      <div className="card">
        <p className="card-title">This week</p>
        <div className="legend-row">
          <span><span className="swatch" style={{ background: "#7F77DD" }} />Hours slept</span>
          <span><span className="swatch dashed" />Goal</span>
        </div>
        <div className="chart-wrap" style={{ height: 160 }}>
          <Chart type="bar" data={data} options={options} aria-label="Bar chart of hours slept over the last 7 nights against goal" role="img" />
        </div>
      </div>

      {underGoal > 0 && (
        <div className="card muted-card">
          <p className="small">You're averaging {underGoal} min under your sleep goal this week. Try a 9:30pm wind-down quest tonight for bonus xp.</p>
        </div>
      )}

      <div className="inline-form">
        <input type="number" step="0.5" min="0" placeholder="Hours slept last night" value={hoursInput} onChange={(e) => setHoursInput(e.target.value)} />
        <button className="btn-small" onClick={handleLog}>Log sleep</button>
      </div>
    </div>
  );
}
