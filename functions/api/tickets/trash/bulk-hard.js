/**
 * POST /api/tickets/trash/bulk-hard -> permanently delete soft-deleted tickets by ids
 *
 * Body: { ids: number[] }
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

function normalizeIds(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const v of raw) {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) out.push(Math.trunc(n));
  }
  // unique
  return Array.from(new Set(out));
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function onRequestPost({ request, env }) {
  const a1 = requireEditKey(request, env);
  if (a1) return a1;
  const a2 = requireDangerKey(request, env);
  if (a2) return a2;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const ids = normalizeIds(body?.ids);
  if (!ids.length) {
    return jsonResponse({ ok: false, error: "ids required" }, { status: 400 });
  }

  // SQLite has a 999 variable default limit, keep it safe.
  const chunks = chunk(ids, 200);
  let deleted = 0;

  try {
    for (const part of chunks) {
      const placeholders = part.map(() => "?").join(",");
      const sql = `DELETE FROM tickets WHERE is_deleted=1 AND id IN (${placeholders})`;
      const r = await env.DB.prepare(sql).bind(...part).run();
      deleted += Number(r?.meta?.changes ?? 0);
    }

    return jsonResponse({ ok: true, deleted });
  } catch (e) {
    return jsonResponse(
      { ok: false, error: "schema_missing", hint: "Your tickets table needs is_deleted/deleted_at columns." },
      { status: 500 }
    );
  }
}
