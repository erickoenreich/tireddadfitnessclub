import { useState } from "react";
import { LuSearch } from "react-icons/lu";

const CREDS_KEY = "tdfc_nutritionix";

// Normalize a string for fuzzy brand-name matching: lowercase, strip
// punctuation and spaces so "McDonald's" == "mcdonalds", etc.
function normalize(s) {
  return (s || "").toLowerCase().replace(/['’\s\-&.]/g, "");
}

function brandMatches(brandName, query) {
  const bn = normalize(brandName);
  const q = normalize(query);
  if (!bn || !q) return false;
  return (
    bn.includes(q) ||
    q.includes(bn) ||
    query
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .some((w) => bn.includes(normalize(w)))
  );
}

// Shows the one-time Nutritionix credentials setup before anything else.
function CredentialsSetup({ onSave }) {
  const [appId, setAppId] = useState("");
  const [appKey, setAppKey] = useState("");

  function save() {
    const c = { appId: appId.trim(), appKey: appKey.trim() };
    localStorage.setItem(CREDS_KEY, JSON.stringify(c));
    onSave(c);
  }

  return (
    <div className="panel">
      <div className="card">
        <p className="card-title">Connect Nutritionix</p>
        <p className="small muted" style={{ marginBottom: 12 }}>
          Restaurant meal data comes from Nutritionix — a free API covering hundreds of chains.
          Sign up at <strong>nutritionix.com/business/api</strong> to get your App ID and App Key
          (free, about 2 minutes).
        </p>
        <label className="field-label">App ID</label>
        <input
          placeholder="e.g. a1b2c3d4"
          value={appId}
          onChange={(e) => setAppId(e.target.value)}
        />
        <label className="field-label" style={{ marginTop: 8 }}>App Key</label>
        <input
          placeholder="e.g. abc123def456..."
          value={appKey}
          onChange={(e) => setAppKey(e.target.value)}
        />
        <button
          className="btn-primary"
          style={{ width: "100%", marginTop: 10 }}
          onClick={save}
          disabled={!appId.trim() || !appKey.trim()}
        >
          Save and start searching
        </button>
      </div>
    </div>
  );
}

function loadCreds() {
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // Corrupted entry — start fresh
    return null;
  }
}

export default function EatOut({ state }) {
  const [creds, setCreds] = useState(loadCreds);
  const [restaurant, setRestaurant] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  function clearCreds() {
    localStorage.removeItem(CREDS_KEY);
    setCreds(null);
    setResults([]);
    setHasSearched(false);
    setError(null);
  }

  async function search() {
    if (!restaurant.trim() || !creds || loading) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const url = `https://trackapi.nutritionix.com/v2/search/instant?query=${encodeURIComponent(
        restaurant
      )}&branded=true&detailed=true`;
      const res = await fetch(url, {
        headers: {
          "x-app-id": creds.appId,
          "x-app-key": creds.appKey,
          "x-remote-user-id": "0",
        },
      });

      if (!res.ok) {
        if (res.status === 401)
          throw new Error("Invalid API credentials — check your App ID and Key.");
        throw new Error(`Nutritionix returned error ${res.status}.`);
      }

      const data = await res.json();

      const items = (data.branded || [])
        // Only items actually from this restaurant
        .filter((i) => brandMatches(i.brand_name, restaurant))
        // Skip condiments, drinks, tiny sides, and multi-serving platters
        .filter((i) => i.nf_calories >= 150 && i.nf_calories <= 1400 && i.nf_protein > 0)
        // Best protein density first — what matters most on a cut
        .sort((a, b) => b.nf_protein / b.nf_calories - a.nf_protein / a.nf_calories)
        .slice(0, 6);

      setResults(items);
      if (items.length === 0) {
        setError(
          'No menu items found. Try a simpler spelling — e.g. "Chipotle" instead of "Chipotle Mexican Grill".'
        );
      }
    } catch (e) {
      setError(e.message || "Something went wrong. Check your connection and try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  if (!creds) {
    return <CredentialsSetup onSave={(c) => setCreds(c)} />;
  }

  const goal = state.weightLossGoal;

  return (
    <div className="panel">
      {/* Daily targets for reference while picking a meal */}
      {goal && (
        <div className="metric-grid metric-grid-3">
          <div className="metric">
            <p className="metric-label">Daily cal</p>
            <p className="metric-value">{goal.calorieGoal}</p>
          </div>
          <div className="metric">
            <p className="metric-label">Protein</p>
            <p className="metric-value">{goal.proteinG}g</p>
          </div>
          <div className="metric">
            <p className="metric-label">Carbs</p>
            <p className="metric-value">{goal.carbsG}g</p>
          </div>
        </div>
      )}

      <div className="card">
        <p className="card-title">Find a restaurant meal</p>
        <p className="muted tiny" style={{ marginBottom: 8 }}>
          Results are sorted by protein density — highest protein per calorie first.
        </p>
        <div className="inline-form">
          <input
            placeholder="e.g. Chipotle, McDonald's, Panera..."
            value={restaurant}
            onChange={(e) => setRestaurant(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <button
            className="btn-small"
            onClick={search}
            disabled={loading || !restaurant.trim()}
          >
            {loading ? "..." : <LuSearch aria-hidden="true" />}
          </button>
        </div>
        {error && (
          <p className="tiny" style={{ color: "var(--amber)", marginTop: 6 }}>
            {error}
          </p>
        )}
      </div>

      {results.map((item, i) => {
        const protPct = goal
          ? Math.round((item.nf_protein / goal.proteinG) * 100)
          : null;
        const calPct = goal
          ? Math.round((item.nf_calories / goal.calorieGoal) * 100)
          : null;

        return (
          <div className="card" key={item.nix_item_id || i}>
            <div className="row-between" style={{ marginBottom: 8 }}>
              <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
                <p className="bold small" style={{ margin: 0 }}>{item.food_name}</p>
                <p className="muted tiny" style={{ margin: "2px 0 0" }}>{item.brand_name}</p>
              </div>
              {i === 0 && <span className="xp-tag success">Best pick</span>}
            </div>
            <div className="metric-grid">
              <div className="metric">
                <p className="metric-label">Cal</p>
                <p className="metric-value">{Math.round(item.nf_calories)}</p>
              </div>
              <div className="metric">
                <p className="metric-label">Protein</p>
                <p className="metric-value">{Math.round(item.nf_protein)}g</p>
              </div>
              <div className="metric">
                <p className="metric-label">Carbs</p>
                <p className="metric-value">{Math.round(item.nf_total_carbohydrate)}g</p>
              </div>
              <div className="metric">
                <p className="metric-label">Fat</p>
                <p className="metric-value">{Math.round(item.nf_total_fat)}g</p>
              </div>
            </div>
            {goal && (
              <p className="muted tiny" style={{ marginTop: 6 }}>
                {calPct}% of your daily calories · {protPct}% of your daily protein
              </p>
            )}
            <p className="muted tiny" style={{ marginTop: 2 }}>
              Serving: {item.serving_qty} {item.serving_unit}
            </p>
          </div>
        );
      })}

      {hasSearched && results.length === 0 && !loading && !error && (
        <p className="muted small" style={{ textAlign: "center", padding: "12px 0" }}>
          No results to show.
        </p>
      )}

      <button
        className="btn-small"
        style={{ width: "100%", color: "var(--text-tertiary)" }}
        onClick={clearCreds}
      >
        Reset API credentials
      </button>
    </div>
  );
}
