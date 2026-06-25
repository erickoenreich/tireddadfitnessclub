import { useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import { LuPlus } from "react-icons/lu";
import { commonOptions, CHART_FONT } from "../charts";

export default function Progress({ state, derived, actions }) {
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
  const options = {
    ...commonOptions,
    scales: {
      y: { ticks: { font: CHART_FONT } },
      x: { ticks: { font: CHART_FONT } },
    },
  };

  function handleWeighIn() {
    const n = Number(weightInput);
    if (!Number.isNaN(n) && n > 0) {
      actions.addWeighIn(n);
      setWeightInput("");
    }
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
    <div className="panel">
      <div className="metric-grid metric-grid-3">
        <div className="metric"><p className="metric-label">Current</p><p className="metric-value">{derived.currentWeight ?? "—"} lb</p></div>
        <div className="metric"><p className="metric-label">Change</p><p className="metric-value" style={{ color: derived.weightChange <= 0 ? "var(--success)" : "var(--text)" }}>{derived.weightChange != null ? `${derived.weightChange > 0 ? "+" : ""}${derived.weightChange} lb` : "—"}</p></div>
        <div className="metric"><p className="metric-label">Goal</p><p className="metric-value">{state.goalWeight} lb</p></div>
      </div>

      <div className="card">
        <div className="legend-row">
          <span><span className="swatch" style={{ background: "#378ADD" }} />Weight</span>
          <span><span className="swatch dashed" />Goal</span>
        </div>
        <div className="chart-wrap" style={{ height: 180 }}>
          <Line data={data} options={options} aria-label="Line chart of weight over time against goal" role="img" />
        </div>
        <div className="inline-form" style={{ marginTop: 10 }}>
          <input type="number" step="0.1" placeholder="Today's weight (lb)" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} />
          <button className="btn-small" onClick={handleWeighIn}>Weigh in</button>
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
    </div>
  );
}
