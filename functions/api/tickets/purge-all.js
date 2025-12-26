/**
 * DELETE /api/tickets/purge-all -> permanently delete ALL data in the database
 *
 * Requires BOTH:
 *  - EDIT_KEY   (X-EDIT-KEY)
 *  - DANGER_KEY (X-DANGER-KEY)
 *
 * D1 binding name: DB
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

function getKeyFromRequest(request, headerName, queryKeys = []) {
  const url = new URL(request.url);
  const headerVal =
    request.headers.get(headerName) ||
    request.headers.get(String(headerName || "").toLowerCase()) ||
    "";
  if (headerVal) return headerVal;
  for (const k of queryKeys) {
    const v = url.searchParams.get(k);
    if (v) return v;
  }
  return "";
}

function requireEditKey(request, env) {
  const expected = String(env.EDIT_KEY || "");
  if (!expected) return new Response("Server misconfigured: EDIT_KEY is not set", { status: 500 });
  const provided = getKeyFromRequest(request, "X-EDIT-KEY", ["key"]);
  if (provided !== expected) return new Response("Unauthorized", { status: 401 });
  return null;
}

function requireDangerKey(request, env) {
  const expected = String(env.DANGER_KEY || "");
  if (!expected) return new Response("Server misconfigured: DANGER_KEY is not set", { status: 500 });
  const provided = getKeyFromRequest(request, "X-DANGER-KEY", ["danger", "danger_key"]);
  if (provided !== expected) return new Response("Unauthorized", { status: 401 });
  return null;
}

async function listUserTables(env) {
  // Try to list all non-system tables. Fallback to ["tickets"] if blocked.
  try {
    const { results } = await env.DB
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
      .all();
    const names = (results || [])
      .map((r) => String(r?.name || "").trim())
      .filter((n) => n && /^[A-Za-z0-9_]+$/.test(n));
    return names.length ? names : ["tickets"];
  } catch {
    return ["tickets"];
  }
}

export async function onRequestDelete({ request, env }) {
  const auth1 = requireEditKey(request, env);
  if (auth1) return auth1;

  const auth2 = requireDangerKey(request, env);
  if (auth2) return auth2;

  if (!env.DB) return new Response("Server misconfigured: DB binding is missing", { status: 500 });

  const tables = await listUserTables(env);

  try {
    let total = 0;

    for (const t of tables) {
      // count
      try {
        const row = await env.DB.prepare(`SELECT COUNT(*) as n FROM ${t}`).first();
        total += Number(row?.n || 0);
      } catch {
        // ignore count errors
      }

      // delete
      await env.DB.prepare(`DELETE FROM ${t}`).run();

      // reset autoincrement for tickets (best-effort)
      if (t === "tickets") {
        try {
          await env.DB.prepare("DELETE FROM sqlite_sequence WHERE name='tickets'").run();
        } catch {}
      }
    }

    return jsonResponse({ ok: true, deleted: total, tables });
  } catch (e) {
    console.error(e);
    return jsonResponse({ ok: false, error: "purge failed" }, { status: 500 });
  }
}
