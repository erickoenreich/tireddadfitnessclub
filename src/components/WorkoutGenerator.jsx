import { useState } from "react";
import { LuCheck } from "react-icons/lu";
import { generateWorkout, EQUIPMENT_OPTIONS, FOCUS_OPTIONS } from "../data/exercises";

export default function WorkoutGenerator({ actions }) {
  const [equipment, setEquipment] = useState(["bodyweight", "dumbbells"]);
  const [minutes, setMinutes] = useState(35);
  const [focus, setFocus] = useState("upper");
  const [workout, setWorkout] = useState(() => generateWorkout({ equipment: ["bodyweight", "dumbbells"], minutes: 35, focus: "upper" }));
  const [logged, setLogged] = useState(false);

  function toggleEquipment(value) {
    setEquipment((prev) => prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]);
  }

  function handleGenerate() {
    setWorkout(generateWorkout({ equipment, minutes, focus }));
    setLogged(false);
  }

  function handleComplete() {
    actions.completeWorkout(workout.totalXp);
    setLogged(true);
  }

  return (
    <div className="panel">
      <div className="card">
        <label className="field-label">Equipment available</label>
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

        <label className="field-label" style={{ marginTop: 10 }}>Time available</label>
        <div className="slider-row">
          <input type="range" min="15" max="60" step="5" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
          <span className="slider-value">{minutes} min</span>
        </div>

        <label className="field-label" style={{ marginTop: 10 }}>Focus</label>
        <select value={focus} onChange={(e) => setFocus(e.target.value)}>
          {FOCUS_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        <button className="btn-primary" style={{ width: "100%", marginTop: 10 }} onClick={handleGenerate}>
          Generate workout
        </button>
      </div>

      <div className="card">
        <div className="row-between">
          <p className="card-title" style={{ margin: 0 }}>{workout.name}</p>
          <span className="xp-tag">+{workout.totalXp} xp</span>
        </div>
        {workout.exercises.length === 0 && (
          <p className="muted small">No exercises match that equipment + focus combo. Try adding more equipment.</p>
        )}
        {workout.exercises.map((ex, i) => (
          <div className="quest-row" key={ex.name + i}>
            <span className="quest-label">{ex.name}</span>
            <span className="muted small">{ex.sets} x {ex.reps}</span>
          </div>
        ))}
        {workout.exercises.length > 0 && (
          <button className="btn-primary" style={{ width: "100%", marginTop: 10 }} onClick={handleComplete} disabled={logged}>
            {logged ? <>Logged <LuCheck aria-hidden="true" style={{ verticalAlign: -2 }} /></> : "Mark workout complete"}
          </button>
        )}
      </div>
    </div>
  );
}
