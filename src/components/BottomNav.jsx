import { LuHouse, LuTarget, LuUtensilsCrossed, LuDumbbell, LuFootprints, LuMoon, LuTrendingUp } from "react-icons/lu";

const TABS = [
  { id: "home", label: "Home", Icon: LuHouse },
  { id: "goals", label: "Goals", Icon: LuTarget },
  { id: "meals", label: "Meals", Icon: LuUtensilsCrossed },
  { id: "workout", label: "Train", Icon: LuDumbbell },
  { id: "steps", label: "Steps", Icon: LuFootprints },
  { id: "sleep", label: "Sleep", Icon: LuMoon },
  { id: "progress", label: "Stats", Icon: LuTrendingUp },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={"nav-btn" + (active === tab.id ? " active" : "")}
          onClick={() => onChange(tab.id)}
        >
          <tab.Icon className="nav-icon" aria-hidden="true" />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
