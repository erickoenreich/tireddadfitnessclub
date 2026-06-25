import { LuX } from "react-icons/lu";

export default function Paywall({ onClose }) {
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Membership plans">
      <div className="overlay-card">
        <div className="row-between" style={{ marginBottom: 10 }}>
          <span className="bold">Go full dad mode</span>
          <button className="icon-btn" aria-label="Close" onClick={onClose}><LuX aria-hidden="true" /></button>
        </div>
        <p className="small muted" style={{ marginBottom: 12 }}>
          Unlock meal and workout generators, the full xp system, and accountability quests.
        </p>
        <div className="plan-row">
          <span className="small">Monthly</span>
          <span className="bold small">$14.99/mo</span>
        </div>
        <div className="plan-row plan-featured">
          <span className="save-badge">Save 45%</span>
          <span className="small">Annual — $99/yr</span>
          <span className="bold small">$8.25/mo</span>
        </div>
        <button className="btn-primary" style={{ width: "100%", marginTop: 8 }} onClick={onClose}>
          Start 7-day free trial
        </button>
      </div>
    </div>
  );
}
