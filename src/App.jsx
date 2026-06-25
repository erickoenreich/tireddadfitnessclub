import { useState } from "react";
import "./charts";
import { useAppState } from "./state/useAppState";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import Coach from "./components/Coach";
import Goals from "./components/Goals";
import MealPlanner from "./components/MealPlanner";
import WorkoutGenerator from "./components/WorkoutGenerator";
import StepsTracker from "./components/StepsTracker";
import SleepTracker from "./components/SleepTracker";
import Progress from "./components/Progress";
import Paywall from "./components/Paywall";
import "./App.css";

export default function App() {
  const [tab, setTab] = useState("home");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const { state, derived, actions, helpers } = useAppState();

  return (
    <div className="app-shell">
      <div className="phone">
        <Header
          streak={state.streak}
          onOpenPaywall={() => setPaywallOpen(true)}
          locked={false}
        />

        {tab === "home"     && <Coach state={state} actions={actions} />}
        {tab === "goals"    && <Goals state={state} derived={derived} actions={actions} />}
        {tab === "meals"    && <MealPlanner state={state} actions={actions} />}
        {tab === "workout"  && <WorkoutGenerator actions={actions} />}
        {tab === "steps"    && <StepsTracker state={state} derived={derived} actions={actions} helpers={helpers} />}
        {tab === "sleep"    && <SleepTracker state={state} derived={derived} actions={actions} helpers={helpers} />}
        {tab === "progress" && <Progress state={state} derived={derived} actions={actions} />}

        <BottomNav active={tab} onChange={setTab} />

        {paywallOpen && <Paywall onClose={() => setPaywallOpen(false)} />}
      </div>
    </div>
  );
}
