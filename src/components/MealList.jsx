import { useState } from "react";
import { LuChevronDown, LuChevronRight } from "react-icons/lu";
import { mealLabel } from "../data/foods";

// Renders a one-day meal list where each row expands to show plain-language
// serving sizes. Shared by the Meals tab and the Goals tab so both stay
// visually and behaviorally consistent.
export default function MealList({ meals }) {
  const [expandedSlot, setExpandedSlot] = useState(null);

  function toggleSlot(slot) {
    setExpandedSlot((prev) => (prev === slot ? null : slot));
  }

  return (
    <>
      <p className="muted tiny" style={{ margin: "-4px 0 4px" }}>Tap a meal to see serving sizes</p>
      {meals.map((m) => {
        const isOpen = expandedSlot === m.slot;
        return (
          <div key={m.slot}>
            <button className="meal-row" onClick={() => toggleSlot(m.slot)} aria-expanded={isOpen}>
              {isOpen ? <LuChevronDown className="meal-chevron" aria-hidden="true" /> : <LuChevronRight className="meal-chevron" aria-hidden="true" />}
              <span className="quest-label">{mealLabel(m)} — {m.name}</span>
              <span className="muted small">{m.calories} cal</span>
            </button>
            {isOpen && (
              <div className="meal-detail">
                <p className="field-label" style={{ margin: "0 0 6px" }}>Serving sizes</p>
                {m.servings.map((s, i) => (
                  <p className="small" style={{ margin: "0 0 4px" }} key={i}>{s}</p>
                ))}
                <p className="muted tiny" style={{ marginTop: 8 }}>
                  {m.calories} cal · {m.protein}g protein · {m.carbs}g carbs · {m.fat}g fat
                </p>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
