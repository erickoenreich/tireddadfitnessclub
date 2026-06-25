import { LuCircleCheckBig, LuCircle } from "react-icons/lu";

export default function Dashboard({ state, derived, onNavigate }) {
  const { level, xpIntoLevel, xpForNextLevel, rank, freeMealStreakTarget } = derived;
  const pct = Math.round((xpIntoLevel / xpForNextLevel) * 100);
  const streakPct = Math.round((state.dietStreak / freeMealStreakTarget) * 100);

  return (
    <div className="panel">
      <div className="card level-card">
        <div className="level-avatar">{level}</div>
        <div className="level-info">
          <div className="level-row">
            <span className="bold">{rank}</span>
            <span className="muted small">{xpIntoLevel.toLocaleString()} / {xpForNextLevel.toLocaleString()} xp</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill amber" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="row-between" style={{ marginBottom: 6 }}>
          <span className="bold small">Diet streak</span>
          <span className="muted small">{state.dietStreak} / {freeMealStreakTarget} days to a free meal</span>
        </div>
        <div className="bar-track">
          <div className="bar-fill success" style={{ width: `${streakPct}%` }} />
        </div>
        {state.freeMealsEarned > 0 && (
          <p className="muted tiny" style={{ margin: "6px 0 0" }}>{state.freeMealsEarned} free meal{state.freeMealsEarned > 1 ? "s" : ""} earned so far</p>
        )}
      </div>

      <div className="card">
        <p className="card-title">Today's quests</p>
        {state.quests.map((q) => (
          <div className="quest-row" key={q.id}>
            {q.done
              ? <LuCircleCheckBig aria-hidden="true" style={{ color: "var(--success)" }} />
              : <LuCircle aria-hidden="true" style={{ color: "var(--text-tertiary)" }} />}
            <span className={"quest-label" + (q.done ? " done" : "")}>{q.label}</span>
            <span className={"xp-tag" + (q.done ? " success" : "")}>+{q.xpReward} xp</span>
          </div>
        ))}
      </div>

      <div>
        <p className="muted tiny">Push notification</p>
        <div className="card notification-card">
          <div className="notification-head">
            <span className="notification-dot" />
            <span className="bold small">Tired Dad Fitness Club</span>
            <span className="muted tiny">now</span>
          </div>
          <p className="small">23 min left before today's quest resets. Get the workout in — your kids are watching how you show up.</p>
          <button className="btn-small" onClick={() => onNavigate("workout")}>Start workout →</button>
        </div>
      </div>
    </div>
  );
}
