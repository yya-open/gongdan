/**
 * GET /api/danger-test -> verify DANGER_KEY (for UI "危险口令" 测试)
 * Requires DANGER_KEY.
 */
function getDangerKeyFromRequest(request) {
  const url = new URL(request.url);
  return (
    request.headers.get("X-DANGER-KEY") ||
    request.headers.get("x-danger-key") ||
    url.searchParams.get("danger") ||
    url.searchParams.get("danger_key") ||
    url.searchParams.get("key") ||
    ""
  );
}

function requireDangerKey(request, env) {
  const expected = String(env.DANGER_KEY || "");
  if (!expected) {
    return new Response("Server misconfigured: DANGER_KEY is not set", { status: 500 });
  }
  const provided = getDangerKeyFromRequest(request);
  if (provided !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}

export async function onRequestGet({ request, env }) {
  const denied = requireDangerKey(request, env);
  if (denied) return denied;
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store",
    },
  });
}
