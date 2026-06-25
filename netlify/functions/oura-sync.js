// Fetches today's sleep, activity, and readiness from Oura API v2.
// POST body: { accessToken: string }

async function fetchOura(endpoint, accessToken) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const url = `https://api.ouraring.com/v2/usercollection/${endpoint}?start_date=${yesterday}&end_date=${today}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Oura ${endpoint} ${res.status}`);
  return res.json();
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { accessToken } = body;
  if (!accessToken) {
    return { statusCode: 400, body: JSON.stringify({ error: "accessToken required" }) };
  }

  try {
    const [sleepRes, activityRes, readinessRes] = await Promise.all([
      fetchOura("daily_sleep", accessToken),
      fetchOura("daily_activity", accessToken),
      fetchOura("daily_readiness", accessToken),
    ]);

    // Pick the most recent entry for each
    const sleep = sleepRes.data?.[sleepRes.data.length - 1] ?? null;
    const activity = activityRes.data?.[activityRes.data.length - 1] ?? null;
    const readiness = readinessRes.data?.[readinessRes.data.length - 1] ?? null;

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sleep: sleep ? {
          date: sleep.day,
          totalSleepHours: Math.round((sleep.total_sleep_duration / 3600) * 10) / 10,
          score: sleep.score,
          remHours: Math.round((sleep.rem_sleep_duration / 3600) * 10) / 10,
          deepHours: Math.round((sleep.deep_sleep_duration / 3600) * 10) / 10,
        } : null,
        activity: activity ? {
          date: activity.day,
          steps: activity.steps,
          activeCalories: activity.active_calories,
          score: activity.score,
        } : null,
        readiness: readiness ? {
          date: readiness.day,
          score: readiness.score,
          hrvBalance: readiness.contributors?.hrv_balance ?? null,
          recoveryIndex: readiness.contributors?.recovery_index ?? null,
        } : null,
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
