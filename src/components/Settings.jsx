import OuraConnect from "./OuraConnect";

// Each device entry has: id, label, component (or null if coming soon)
const DEVICES = [
  { id: "oura", label: "Oura Ring", Component: OuraConnect },
  { id: "whoop", label: "Whoop", Component: null },
  { id: "fitbit", label: "Fitbit", Component: null },
  { id: "garmin", label: "Garmin", Component: null },
];

export default function Settings({ state, actions }) {
  return (
    <div className="panel">
      <p className="card-title" style={{ fontSize: 15, margin: 0 }}>Connected Devices</p>
      <p className="muted tiny" style={{ marginTop: 2 }}>
        Sync your wearable data automatically into the app.
      </p>

      {DEVICES.map(({ id, label, Component }) =>
        Component ? (
          <Component key={id} state={state} actions={actions} />
        ) : (
          <div key={id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-secondary)" }}>{label}</span>
            <span style={{ fontSize: 11, color: "var(--text-tertiary)", background: "var(--surface-muted)", borderRadius: 999, padding: "3px 10px" }}>
              Coming soon
            </span>
          </div>
        )
      )}
    </div>
  );
}
