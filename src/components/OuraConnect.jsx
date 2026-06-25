import { useState, useEffect } from "react";
import { LuRefreshCw, LuUnlink } from "react-icons/lu";
import { SiOura } from "react-icons/si";

const OURA_CLIENT_ID = import.meta.env.VITE_OURA_CLIENT_ID;
const REDIRECT_URI = window.location.origin;
const OURA_AUTH_URL = `https://cloud.ouraring.com/oauth/authorize?response_type=code&client_id=${OURA_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=daily`;

export default function OuraConnect({ state, actions }) {
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  const connected = !!state.ouraAccessToken;

  // Handle OAuth callback — pick up ?code= from URL after Oura redirects back.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (!code) return;

    // Clear the code from the URL immediately so refresh doesn't re-trigger.
    window.history.replaceState({}, document.title, window.location.pathname);

    (async () => {
      try {
        const res = await fetch("/.netlify/functions/oura-token", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ code, redirectUri: REDIRECT_URI }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Token exchange failed");
        actions.setOuraTokens(data.accessToken, data.refreshToken);
      } catch (e) {
        setSyncError(`Connection failed: ${e.message}`);
      }
    })();
  }, []);

  // Auto-sync when connected and no recent sync.
  useEffect(() => {
    if (connected && !lastSync) syncData();
  }, [connected]);

  async function syncData() {
    setSyncing(true);
    setSyncError(null);
    try {
      const res = await fetch("/.netlify/functions/oura-sync", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ accessToken: state.ouraAccessToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");

      if (data.sleep?.totalSleepHours) actions.logSleep(data.sleep.totalSleepHours);
      if (data.activity?.steps) actions.logSteps(data.activity.steps);
      actions.setOuraData(data);
      setLastSync(new Date().toLocaleTimeString());
    } catch (e) {
      setSyncError(e.message);
    } finally {
      setSyncing(false);
    }
  }

  function disconnect() {
    actions.setOuraTokens(null, null);
    actions.setOuraData(null);
    setLastSync(null);
  }

  const oura = state.ouraData;

  return (
    <div className="card">
      <div className="row-between" style={{ marginBottom: connected ? 12 : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SiOura style={{ fontSize: 18, color: "var(--text)" }} aria-hidden="true" />
          <span style={{ fontWeight: 700, fontSize: 14 }}>Oura Ring</span>
          {connected && (
            <span style={{ fontSize: 11, color: "var(--success)", background: "var(--success-bg)", borderRadius: 999, padding: "2px 8px" }}>
              Connected
            </span>
          )}
        </div>
        {connected ? (
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn-small" onClick={syncData} disabled={syncing} title="Sync now">
              <LuRefreshCw size={12} style={{ marginRight: 4, animation: syncing ? "spin 1s linear infinite" : "none" }} />
              {syncing ? "Syncing…" : "Sync"}
            </button>
            <button className="btn-small" onClick={disconnect} title="Disconnect">
              <LuUnlink size={12} />
            </button>
          </div>
        ) : (
          <a href={OURA_AUTH_URL} className="btn-small" style={{ textDecoration: "none" }}>
            Connect
          </a>
        )}
      </div>

      {connected && oura && (
        <div className="metric-grid metric-grid-3" style={{ marginTop: 4 }}>
          {oura.readiness && (
            <div className="metric">
              <p className="metric-label">Readiness</p>
              <p className="metric-value" style={{ color: oura.readiness.score >= 70 ? "var(--success)" : "var(--amber)" }}>
                {oura.readiness.score}
              </p>
            </div>
          )}
          {oura.sleep && (
            <div className="metric">
              <p className="metric-label">Sleep</p>
              <p className="metric-value">{oura.sleep.totalSleepHours}h</p>
            </div>
          )}
          {oura.activity && (
            <div className="metric">
              <p className="metric-label">Steps</p>
              <p className="metric-value">{oura.activity.steps?.toLocaleString()}</p>
            </div>
          )}
        </div>
      )}

      {syncError && <p style={{ fontSize: 12, color: "var(--amber)", marginTop: 8 }}>{syncError}</p>}
      {lastSync && <p className="tiny muted" style={{ marginTop: 6 }}>Last synced {lastSync}</p>}
    </div>
  );
}
