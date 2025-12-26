/**
 * DELETE /api/tickets/trash/empty -> permanently delete ALL soft-deleted tickets (empty recycle bin)
 *
 * Requires BOTH:
 *  - EDIT_KEY   (X-EDIT-KEY)
 *  - DANGER_KEY (X-DANGER-KEY)
 */
function jsonResponse(data, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
}

function getKeyFromRequest(request, headerName, qsNames = []) {
  const url = new URL(request.url);
  return (
    request.headers.get(headerName) ||
    request.headers.get(headerName.toLowerCase()) ||
    qsNames.map((k) => url.searchParams.get(k)).find((v) => v) ||
    ""
  );
}

function requireEditKey(request, env) {
  const expected = String(env.EDIT_KEY || "");
  if (!expected) {
    return new Response("Server misconfigured: EDIT_KEY is not set", { status: 500 });
  }
  const provided = getKeyFromRequest(request, "X-EDIT-KEY", ["key"]);
  if (provided !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}

function requireDangerKey(request, env) {
  const expected = String(env.DANGER_KEY || "");
  if (!expected) {
    return new Response("Server misconfigured: DANGER_KEY is not set", { status: 500 });
  }
  const provided = getKeyFromRequest(request, "X-DANGER-KEY", ["danger", "danger_key"]);
  if (provided !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}

export async function onRequestDelete({ request, env }) {
  const a1 = requireEditKey(request, env);
  if (a1) return a1;
  const a2 = requireDangerKey(request, env);
  if (a2) return a2;

  try {
    const r = await env.DB.prepare("DELETE FROM tickets WHERE is_deleted=1").run();
    const deleted = Number(r?.meta?.changes ?? 0);
    return jsonResponse({ ok: true, deleted });
  } catch (e) {
    return jsonResponse(
      { ok: false, error: "schema_missing", hint: "Your tickets table needs is_deleted/deleted_at columns." },
      { status: 500 }
    );
  }
}
