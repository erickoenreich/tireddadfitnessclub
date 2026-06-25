import { GiCrown } from "react-icons/gi";
import { LuFlame } from "react-icons/lu";

export default function Header({ streak, onOpenPaywall, locked }) {
  return (
    <header className="app-header">
      <span className="app-name">Tired Dad Fitness Club</span>
      {!locked && (
        <div className="header-actions">
          <button className="icon-btn" aria-label="Membership" onClick={onOpenPaywall}>
            <GiCrown aria-hidden="true" />
          </button>
          <span className="streak-pill"><LuFlame aria-hidden="true" /> {streak}</span>
        </div>
      )}
    </header>
  );
}
