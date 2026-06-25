// Netlify serverless function — proxies chat requests to the Anthropic API.
// The API key lives here as an environment variable, never in the client bundle.
//
// Set ANTHROPIC_API_KEY in your Netlify site → Site settings → Environment variables.

function buildSystemPrompt(ctx) {
  const onboarded = ctx.onboardingComplete;

  const userSection = onboarded
    ? `Name: ${ctx.userName || "this user"}
Goal: ${ctx.goalSummary}
Current streak: ${ctx.streak} days
Today: ${ctx.todayDate}
${
  ctx.pendingCheckin
    ? `\nPENDING CHECK-IN: There is an unanswered check-in for ${ctx.pendingCheckin.date}. At a natural point in the conversation, ask how yesterday went — did they hit their calorie goal${ctx.pendingCheckin.workoutPrescribed ? ", and did they get their workout in" : ""}? Once you have clear answers, call submit_checkin.`
    : ""
}`
    : `This is a NEW USER. You need to collect their info to set up their plan. Ask one or two things at a time — don't fire all questions at once. You need:
1. First name
2. Current weight in lbs
3. Goal weight in lbs
4. Meals per day (2, 3, or 4)
5. Training days per week
6. Available equipment — pick any that apply: bodyweight, dumbbells, bands, gym
7. Foods they like (optional — they can say "none")
8. Foods to avoid (optional — they can say "none")

CRITICAL: Once you have items 1–6 (and 7–8 answered even if the answer is "none"), you MUST call the set_goal tool immediately. Do NOT describe the plan in text, do NOT say "I'll set that up", do NOT continue the conversation — just call set_goal. The app cannot create their nutrition and workout plan until you call that tool. After calling it, THEN respond with encouragement.`;

  return `You are Eric, founder of Tired Dad Fitness Club. You are a millennial dad — into video games, comic books, trading cards, and covered in tattoos. You coach other millennial dads who've let their health slip, because you've been there.

Your philosophy is sustainability: you build systems around a guy's actual life — his schedule, his food, his equipment, his family. You don't want a 90-day fix. You want him to change his lifestyle and keep the results forever.

When a guy is winning, go all in. "Hell yeah brother, let's go! You're absolutely destroying it. You're a stud." Real hype, not corporate cheerleading.

When a guy is slipping, call it out. "Do you want results or not? You can't be bullshitting every weekend. Lock in." Then hit what actually matters: "Your kids are watching. Set the example."

You occasionally say "brother" (about 1 in 5 messages), and very rarely "dude" or "man" (maybe 1 in 10 messages). You drop the occasional curse word when you're fired up — because you genuinely care about this stuff. Most of the time you just talk normally without any of those filler words. You are NOT polished. You are NOT a robot. You are NOT a newsletter. Keep replies SHORT — 2 to 4 sentences. This is a text conversation with a buddy.

The deeper mission: dads need to take care of themselves so they can live longer and show up better for their kids. That's what all of this is really about.

NEVER use bullet points. NEVER sound like a fitness app. Sound like Eric.

--- CURRENT USER ---
${userSection}`;
}

const TOOLS = [
  {
    name: "set_goal",
    description:
      "Call this once you have collected all onboarding info (name, current weight, goal weight, meals per day, training days, equipment, and optionally liked/avoided foods) and are ready to create the user's plan.",
    input_schema: {
      type: "object",
      properties: {
        userName: { type: "string" },
        bodyweightLb: { type: "number" },
        goalWeightLb: { type: "number" },
        mealsPerDay: { type: "number", enum: [2, 3, 4] },
        trainingDaysPerWeek: { type: "number" },
        equipment: {
          type: "array",
          items: { type: "string", enum: ["bodyweight", "dumbbells", "bands", "gym"] },
        },
        likedFoodsText: { type: "string" },
        avoidFoodsText: { type: "string" },
      },
      required: [
        "userName",
        "bodyweightLb",
        "goalWeightLb",
        "mealsPerDay",
        "trainingDaysPerWeek",
        "equipment",
      ],
    },
  },
  {
    name: "log_weight",
    description: "Log a weigh-in when the user tells you their current weight.",
    input_schema: {
      type: "object",
      properties: { weight: { type: "number" } },
      required: ["weight"],
    },
  },
  {
    name: "log_steps",
    description: "Log today's step count when the user tells you how many steps they got.",
    input_schema: {
      type: "object",
      properties: { steps: { type: "number" } },
      required: ["steps"],
    },
  },
  {
    name: "submit_checkin",
    description:
      "Submit the daily check-in results once the user has answered how yesterday went.",
    input_schema: {
      type: "object",
      properties: {
        workoutDone: {
          type: "boolean",
          description: "Whether they completed their prescribed workout",
        },
        hitCalorieGoal: {
          type: "boolean",
          description: "Whether they stayed on their calorie target",
        },
      },
      required: ["hitCalorieGoal"],
    },
  },
  {
    name: "update_nutrition",
    description:
      "Adjust the user's nutrition plan based on their feedback — e.g. they're too hungry, losing too fast or slow, or want to change how many meals they eat. Call this when they ask to tweak their diet plan.",
    input_schema: {
      type: "object",
      properties: {
        calorieAdjustment: {
          type: "number",
          description: "Amount to add or subtract from daily calories (e.g. 200 to add 200, -100 to cut 100). Omit if not changing calories.",
        },
        mealsPerDay: {
          type: "number",
          enum: [2, 3, 4],
          description: "New meals per day. Omit if not changing.",
        },
        reason: {
          type: "string",
          description: "Brief reason for the change, e.g. 'too hungry' or 'plateau'",
        },
      },
      required: ["reason"],
    },
  },
  {
    name: "update_training",
    description:
      "Adjust the user's training plan based on their feedback — e.g. they want more or fewer training days, or their equipment situation changed.",
    input_schema: {
      type: "object",
      properties: {
        trainingDaysPerWeek: {
          type: "number",
          description: "New number of training days per week. Omit if not changing.",
        },
        equipment: {
          type: "array",
          items: { type: "string", enum: ["bodyweight", "dumbbells", "bands", "gym"] },
          description: "Updated equipment list. Omit if not changing.",
        },
        reason: {
          type: "string",
          description: "Brief reason for the change",
        },
      },
      required: ["reason"],
    },
  },
];

async function callClaude(apiKey, system, messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system,
      tools: TOOLS,
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${text}`);
  }
  return res.json();
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        error:
          "ANTHROPIC_API_KEY is not set. Go to Netlify → Site settings → Environment variables and add it.",
      }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { messages = [], context = {} } = body;
  const system = buildSystemPrompt(context);

  // Trim to last 40 messages to control token costs on long conversations.
  const trimmed = messages.slice(-40);

  try {
    const round1 = await callClaude(apiKey, system, trimmed);

    const toolBlocks = round1.content.filter((b) => b.type === "tool_use");
    const textBlocks = round1.content.filter((b) => b.type === "text");

    // No tools used — simple text reply.
    if (toolBlocks.length === 0) {
      return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          reply: textBlocks.map((b) => b.text).join(""),
          actions: [],
        }),
      };
    }

    // Tools were used — send tool results back to get Eric's verbal follow-up.
    const toolResults = toolBlocks.map((tc) => ({
      type: "tool_result",
      tool_use_id: tc.id,
      content: "Done",
    }));

    const round2 = await callClaude(apiKey, system, [
      ...trimmed,
      { role: "assistant", content: round1.content },
      { role: "user", content: toolResults },
    ]);

    const finalText = round2.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        reply: finalText,
        actions: toolBlocks.map((tc) => ({ type: tc.name, data: tc.input })),
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: e.message }),
    };
  }
};
