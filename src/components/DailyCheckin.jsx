import { useState } from "react";

function formatDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

// Blocking modal that stands in for a real push notification until
// Firebase Cloud Messaging is wired up. Shows the morning after a day
// passes, asking about that prior day -- can't be dismissed without
// answering, which is the whole point of the accountability feature.
export default function DailyCheckin({ state, actions }) {
  const checkin = state.pendingCheckin;
  const [workoutDone, setWorkoutDone] = useState(null);
  const [hitCalories, setHitCalories] = useState(null);

  if (!checkin && state.pendingFreeMeal) {
    return (
      <div className="overlay">
        <div className="overlay-card">
          <p className="bold" style={{ marginBottom: 8 }}>You earned a free meal</p>
          <p className="small" style={{ margin: "0 0 8px" }}>
            Six days straight at 100% — hitting your workout and calorie goal every single day. That's the deal, and you held up your end.
          </p>
          <p className="small" style={{ margin: "0 0 8px" }}>
            This is your green light to go out to eat, or dine in with the family — not a license to pig out alone.
            Eat something that's not on your plan. Dessert's fine too.
          </p>
          <p className="small muted" style={{ marginBottom: 14 }}>
            Once that meal's done, it's back to business as usual.
          </p>
          <button className="btn-primary" style={{ width: "100%" }} onClick={actions.acknowledgeFreeMeal}>
            Got it, let's go
          </button>
        </div>
      </div>
    );
  }

  if (!checkin) return null;

  const needsWorkoutAnswer = checkin.workoutPrescribed;
  const canSubmit = (!needsWorkoutAnswer || workoutDone !== null) && hitCalories !== null;

  function handleSubmit() {
    actions.submitCheckin({ workoutDone, hitCalorieGoal: hitCalories });
  }

  return (
    <div className="overlay">
      <div className="overlay-card">
        <p className="bold" style={{ marginBottom: 4 }}>Quick check-in</p>
        <p className="muted tiny" style={{ marginBottom: 14 }}>About yesterday — {formatDate(checkin.date)}</p>

        {needsWorkoutAnswer && (
          <div style={{ marginBottom: 14 }}>
            <p className="small" style={{ marginBottom: 8 }}>Did you get your lifting/cardio in?</p>
            <div className="chip-row">
              <button className={"chip" + (workoutDone === true ? " active" : "")} onClick={() => setWorkoutDone(true)}>Yes</button>
              <button className={"chip" + (workoutDone === false ? " active" : "")} onClick={() => setWorkoutDone(false)}>No</button>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <p className="small" style={{ marginBottom: 8 }}>Did you hit your calorie goal?</p>
          <div className="chip-row">
            <button className={"chip" + (hitCalories === true ? " active" : "")} onClick={() => setHitCalories(true)}>Yes</button>
            <button className={"chip" + (hitCalories === false ? " active" : "")} onClick={() => setHitCalories(false)}>No</button>
          </div>
        </div>

        <button className="btn-primary" style={{ width: "100%" }} disabled={!canSubmit} onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}
