import { useState, useRef, useEffect } from "react";
import { LuSend, LuRotateCcw } from "react-icons/lu";

// Eric's opening message — shown instantly on first launch, no API call.
const OPENING_MESSAGE = {
  role: "assistant",
  content: `Welcome to the Tired Dad Fitness Club, dude. I am so pumped you decided to take control of your health and be a better example for your kids — that takes guts, and I respect it.

I'm gonna be straight with you: if you stick with this and do what I say, you will become the best version of yourself. You're gonna be proud of what you see in the mirror. You're gonna feel better. Move better. Have more confidence.

And your kids? They're gonna see the change in you. They're gonna look up to you differently. And most importantly — you're gonna be around longer to watch them grow up. That's what this is really about.

So congrats on taking this step. I can't wait to get started.

Let's lock in. First question — what's your name?`,
};

// Check-in prompt injected automatically when there's a pending check-in.
function buildCheckinMessage(pendingCheckin) {
  const workoutLine = pendingCheckin.workoutPrescribed
    ? " And did you get your workout in?"
    : "";
  return {
    role: "assistant",
    content: `Yo, let's do a quick check-in on yesterday (${pendingCheckin.date}). Did you hit your calorie goal?${workoutLine}`,
  };
}

// Avatar: tries /eric_avatar.jpg, falls back to "E" initial.
function EricAvatar() {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <div className="eric-avatar" aria-hidden="true">
      {imgFailed ? (
        "E"
      ) : (
        <img
          src="/eric_avatar.jpg"
          alt=""
          className="eric-avatar-img"
          onError={() => setImgFailed(true)}
        />
      )}
    </div>
  );
}

// Map AI tool calls to actual app state actions.
// Returns a system confirmation string if one should be shown in the chat.
function handleAction(action, actions) {
  switch (action.type) {
    case "set_goal":
      actions.setWeightLossGoal({
        bodyweightLb: action.data.bodyweightLb,
        goalWeightLb: action.data.goalWeightLb,
        trainingDaysPerWeek: action.data.trainingDaysPerWeek,
        likedFoodsText: action.data.likedFoodsText || "",
        avoidFoodsText: action.data.avoidFoodsText || "",
        equipment: action.data.equipment || ["bodyweight"],
        mealsPerDay: action.data.mealsPerDay,
      });
      if (action.data.userName) actions.setUserName(action.data.userName);
      return "✓ Plan created — check the Goals and Meals tabs to see your targets.";
    case "log_weight":
      actions.addWeighIn(action.data.weight);
      return `✓ Weigh-in logged: ${action.data.weight} lbs`;
    case "log_steps":
      actions.logSteps(action.data.steps);
      return `✓ Steps logged: ${action.data.steps.toLocaleString()}`;
    case "submit_checkin":
      actions.submitCheckin({
        workoutDone: action.data.workoutDone ?? true,
        hitCalorieGoal: action.data.hitCalorieGoal,
      });
      return "✓ Check-in recorded";
    default:
      return null;
  }
}

function buildApiContext(state) {
  const g = state.weightLossGoal;
  return {
    userName: state.userName || null,
    onboardingComplete: !!g,
    goalSummary: g
      ? `${g.calorieGoal} cal/day, ${g.proteinG}g protein, ${g.mealsPerDay} meals/day`
      : null,
    streak: state.streak,
    todayDate: new Date().toISOString().slice(0, 10),
    pendingCheckin: state.pendingCheckin || null,
  };
}

export default function Coach({ state, actions }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // chatMessages is always initialized to [] in defaultState, so this is safe.
  const messages = state.chatMessages;
  const today = new Date().toISOString().slice(0, 10);

  // Inject opening message on very first launch (or after a clear).
  useEffect(() => {
    if (messages.length === 0) {
      actions.addChatMessage(OPENING_MESSAGE);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Inject daily check-in prompt if there's a pending check-in and we
  // haven't asked yet today.
  useEffect(() => {
    if (
      state.pendingCheckin &&
      state.lastCheckinAskDate !== today &&
      messages.length > 0
    ) {
      actions.addChatMessage(buildCheckinMessage(state.pendingCheckin));
      actions.markCheckinAsked();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.pendingCheckin]);

  // Scroll to bottom whenever messages change.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    actions.clearChat();
    setConfirmClear(false);
    setApiError(null);
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    actions.addChatMessage(userMsg);
    setInput("");
    setLoading(true);
    setApiError(null);

    // Build the message history in Anthropic format for the API.
    // Filter out system notices — those aren't part of the conversation.
    const apiMessages = [...messages, userMsg]
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

    try {
      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          context: buildApiContext(state),
        }),
      });

      // Parse JSON safely — if functions aren't deployed, Netlify returns HTML.
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error(
          res.status === 404
            ? "Coach function not deployed. Connect your repo to Netlify (not drag-and-drop) so the serverless function is included."
            : `Unexpected server response (${res.status}). Check your Netlify function deployment.`
        );
      }

      if (!res.ok) {
        throw new Error(data.error || `Server error ${res.status}`);
      }

      // Process any app state actions Eric triggered.
      const confirmations = (data.actions || [])
        .map((action) => handleAction(action, actions))
        .filter(Boolean);

      if (confirmations.length > 0) {
        actions.addChatMessage({ role: "system", content: confirmations.join("\n") });
      }

      // Add Eric's reply to the chat.
      actions.addChatMessage({ role: "assistant", content: data.reply });
    } catch (e) {
      setApiError(e.message);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="coach-shell">
      {/* Toolbar */}
      <div className="coach-toolbar">
        <button
          className={`coach-clear-btn ${confirmClear ? "confirm" : ""}`}
          onClick={handleClear}
          title="Clear chat history"
        >
          <LuRotateCcw size={12} />
          {confirmClear ? "Tap again to clear" : "New chat"}
        </button>
      </div>

      <div className="coach-messages">
        {messages.map((msg, i) => {
          if (msg.role === "system") {
            return (
              <div key={i} className="chat-system-notice">{msg.content}</div>
            );
          }
          return (
            <div key={i} className={`chat-bubble ${msg.role === "assistant" ? "eric" : "user"}`}>
              {msg.role === "assistant" && <EricAvatar />}
              <div className="bubble-text">{msg.content}</div>
            </div>
          );
        })}

        {loading && (
          <div className="chat-bubble eric">
            <EricAvatar />
            <div className="bubble-text thinking">
              <span /><span /><span />
            </div>
          </div>
        )}

        {apiError && (
          <div className="chat-error">
            <span style={{ color: "var(--amber)" }}>⚠ {apiError}</span>
            {apiError.includes("ANTHROPIC_API_KEY") && (
              <p className="tiny muted" style={{ marginTop: 4 }}>
                Add your Anthropic API key in Netlify → Site settings → Environment variables.
              </p>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="coach-input">
        <input
          ref={inputRef}
          placeholder="Message Eric..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="btn-small coach-send"
          onClick={send}
          disabled={loading || !input.trim()}
          aria-label="Send message"
        >
          <LuSend aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
