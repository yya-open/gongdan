var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/pages-rHAl5e/functionsWorker-0.9731235425022281.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
function jsonResponse(data, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store",
      ...headers
    }
  });
}
__name(jsonResponse, "jsonResponse");
__name2(jsonResponse, "jsonResponse");
function getEditKeyFromRequest(request) {
  const url = new URL(request.url);
  return request.headers.get("X-EDIT-KEY") || request.headers.get("x-edit-key") || url.searchParams.get("key") || "";
}
__name(getEditKeyFromRequest, "getEditKeyFromRequest");
__name2(getEditKeyFromRequest, "getEditKeyFromRequest");
function requireEditKey(request, env) {
  const expected = String(env.EDIT_KEY || "");
  if (!expected) {
    return new Response("Server misconfigured: EDIT_KEY is not set", { status: 500 });
  }
  const provided = getEditKeyFromRequest(request);
  if (provided !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}
__name(requireEditKey, "requireEditKey");
__name2(requireEditKey, "requireEditKey");
function parseId(raw) {
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}
__name(parseId, "parseId");
__name2(parseId, "parseId");
async function onRequestDelete({ params, request, env }) {
  const auth = requireEditKey(request, env);
  if (auth) return auth;
  const id = parseId(params.id);
  if (id === null) return jsonResponse({ ok: false, error: "bad id" }, { status: 400 });
  const r = await env.DB.prepare("DELETE FROM tickets WHERE id=?").bind(id).run();
  const changes = Number(r?.meta?.changes ?? 0);
  if (changes === 0) {
    return jsonResponse({ ok: false, error: "not_found" }, { status: 404 });
  }
  return jsonResponse({ ok: true, hard: true });
}
__name(onRequestDelete, "onRequestDelete");
__name2(onRequestDelete, "onRequestDelete");
function jsonResponse2(data, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store",
      ...headers
    }
  });
}
__name(jsonResponse2, "jsonResponse2");
__name2(jsonResponse2, "jsonResponse");
function getEditKeyFromRequest2(request) {
  const url = new URL(request.url);
  return request.headers.get("X-EDIT-KEY") || request.headers.get("x-edit-key") || url.searchParams.get("key") || "";
}
__name(getEditKeyFromRequest2, "getEditKeyFromRequest2");
__name2(getEditKeyFromRequest2, "getEditKeyFromRequest");
function requireEditKey2(request, env) {
  const expected = String(env.EDIT_KEY || "");
  if (!expected) {
    return new Response("Server misconfigured: EDIT_KEY is not set", { status: 500 });
  }
  const provided = getEditKeyFromRequest2(request);
  if (provided !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}
__name(requireEditKey2, "requireEditKey2");
__name2(requireEditKey2, "requireEditKey");
function parseId2(raw) {
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}
__name(parseId2, "parseId2");
__name2(parseId2, "parseId");
async function onRequestPut({ params, request, env }) {
  const auth = requireEditKey2(request, env);
  if (auth) return auth;
  const id = parseId2(params.id);
  if (id === null) return jsonResponse2({ ok: false, error: "bad id" }, { status: 400 });
  try {
    const r = await env.DB.prepare(
      `UPDATE tickets
         SET is_deleted=0,
             deleted_at=NULL,
             updated_at=datetime('now')
         WHERE id=? AND is_deleted=1`
    ).bind(id).run();
    const changes = Number(r?.meta?.changes ?? 0);
    if (changes === 0) {
      const q = await env.DB.prepare("SELECT id, is_deleted FROM tickets WHERE id=?").bind(id).all();
      const row = q?.results?.[0];
      if (!row) return jsonResponse2({ ok: false, error: "not_found" }, { status: 404 });
      return jsonResponse2({ ok: true, already: true });
    }
    return jsonResponse2({ ok: true });
  } catch (e) {
    return jsonResponse2(
      { ok: false, error: "schema_missing", hint: "Your tickets table needs is_deleted/deleted_at columns." },
      { status: 500 }
    );
  }
}
__name(onRequestPut, "onRequestPut");
__name2(onRequestPut, "onRequestPut");
function jsonResponse3(data, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store",
      ...headers
    }
  });
}
__name(jsonResponse3, "jsonResponse3");
__name2(jsonResponse3, "jsonResponse");
function getEditKeyFromRequest3(request) {
  const url = new URL(request.url);
  return request.headers.get("X-EDIT-KEY") || request.headers.get("x-edit-key") || url.searchParams.get("key") || "";
}
__name(getEditKeyFromRequest3, "getEditKeyFromRequest3");
__name2(getEditKeyFromRequest3, "getEditKeyFromRequest");
function requireEditKey3(request, env) {
  const expected = String(env.EDIT_KEY || "");
  if (!expected) {
    return new Response("Server misconfigured: EDIT_KEY is not set", { status: 500 });
  }
  const provided = getEditKeyFromRequest3(request);
  if (provided !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}
__name(requireEditKey3, "requireEditKey3");
__name2(requireEditKey3, "requireEditKey");
function pickFirstNonEmptyArray(...arrs) {
  for (const a of arrs) {
    if (Array.isArray(a) && a.length > 0) return a;
  }
  for (const a of arrs) {
    if (Array.isArray(a)) return a;
  }
  return [];
}
__name(pickFirstNonEmptyArray, "pickFirstNonEmptyArray");
__name2(pickFirstNonEmptyArray, "pickFirstNonEmptyArray");
function parsePayload(payload) {
  let active = [];
  let trash = [];
  if (Array.isArray(payload)) {
    active = payload;
  } else if (payload && typeof payload === "object") {
    active = pickFirstNonEmptyArray(payload.active, payload.records, payload.data, payload.tickets, payload.items);
    trash = pickFirstNonEmptyArray(payload.trash, payload.deleted, payload.recycle_bin);
  } else {
    throw new Error("Expected an array or {active,trash}");
  }
  return { active, trash };
}
__name(parsePayload, "parsePayload");
__name2(parsePayload, "parsePayload");
function normalizeRecord(r, forceDeletedFlag) {
  const obj = r && typeof r === "object" ? r : {};
  const idNum = Number(obj.id ?? obj.ID ?? obj.Id);
  const id = Number.isFinite(idNum) ? idNum : null;
  const updatedAt = String(obj.updated_at ?? obj.updatedAt ?? "").trim();
  const isDeleted = forceDeletedFlag != null ? forceDeletedFlag ? 1 : 0 : Number(obj.is_deleted ?? obj.isDeleted ?? 0) ? 1 : 0;
  const deletedAtRaw = String(obj.deleted_at ?? obj.deletedAt ?? "").trim();
  return {
    id,
    date: String(obj.date ?? obj.\u65E5\u671F ?? obj.time ?? obj.createdAt ?? "").trim(),
    issue: String(obj.issue ?? obj.\u95EE\u9898 ?? obj.question ?? obj.title ?? obj.subject ?? "").trim(),
    department: String(obj.department ?? obj.dept ?? obj.\u90E8\u95E8 ?? obj.departmentName ?? ""),
    name: String(obj.name ?? obj.owner ?? obj.person ?? obj.\u59D3\u540D ?? obj.handler ?? ""),
    solution: String(obj.solution ?? obj.method ?? obj.\u5904\u7406\u65B9\u6CD5 ?? obj.fix ?? ""),
    remarks: String(obj.remarks ?? obj.remark ?? obj.\u5907\u6CE8 ?? obj.note ?? ""),
    type: String(obj.type ?? obj.\u7C7B\u578B ?? obj.category ?? ""),
    updated_at: updatedAt,
    has_updated_at: updatedAt.length > 0,
    is_deleted: isDeleted,
    deleted_at: deletedAtRaw
  };
}
__name(normalizeRecord, "normalizeRecord");
__name2(normalizeRecord, "normalizeRecord");
function normalizeAll({ active, trash }) {
  const normActive = Array.isArray(active) ? active.map((r) => normalizeRecord(r, 0)) : [];
  const normTrash = Array.isArray(trash) ? trash.map((r) => normalizeRecord(r, 1)) : [];
  const all = [];
  for (const r of normActive) all.push(r);
  for (const r of normTrash) all.push(r);
  return { active: normActive, trash: normTrash, all };
}
__name(normalizeAll, "normalizeAll");
__name2(normalizeAll, "normalizeAll");
async function getColumns(env) {
  const { results } = await env.DB.prepare("PRAGMA table_info(tickets)").all();
  const cols = /* @__PURE__ */ new Set();
  for (const r of results || []) cols.add(String(r.name));
  return cols;
}
__name(getColumns, "getColumns");
__name2(getColumns, "getColumns");
async function ensureSoftDeleteColumns(env) {
  const cols = await getColumns(env);
  const stmts = [];
  if (!cols.has("updated_at")) {
    stmts.push(env.DB.prepare("ALTER TABLE tickets ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))"));
  }
  if (!cols.has("is_deleted")) {
    stmts.push(env.DB.prepare("ALTER TABLE tickets ADD COLUMN is_deleted INTEGER DEFAULT 0"));
  }
  if (!cols.has("deleted_at")) {
    stmts.push(env.DB.prepare("ALTER TABLE tickets ADD COLUMN deleted_at TEXT"));
  }
  if (stmts.length > 0) {
    for (const s of stmts) {
      await s.run();
    }
  }
}
__name(ensureSoftDeleteColumns, "ensureSoftDeleteColumns");
__name2(ensureSoftDeleteColumns, "ensureSoftDeleteColumns");
async function fetchExistingUpdatedMap(env, ids) {
  const map = /* @__PURE__ */ new Map();
  const uniq = Array.from(new Set(ids)).filter((v) => Number.isFinite(v));
  const CHUNK = 900;
  for (let i = 0; i < uniq.length; i += CHUNK) {
    const part = uniq.slice(i, i + CHUNK);
    if (part.length === 0) continue;
    const placeholders = part.map(() => "?").join(",");
    const sql = `SELECT id, updated_at FROM tickets WHERE id IN (${placeholders})`;
    const { results } = await env.DB.prepare(sql).bind(...part).all();
    for (const r of results || []) {
      const id = Number(r.id);
      if (Number.isFinite(id)) map.set(id, String(r.updated_at ?? ""));
    }
  }
  return map;
}
__name(fetchExistingUpdatedMap, "fetchExistingUpdatedMap");
__name2(fetchExistingUpdatedMap, "fetchExistingUpdatedMap");
async function onRequestPost({ request, env }) {
  const auth = requireEditKey3(request, env);
  if (auth) return auth;
  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse3({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  let parsed;
  try {
    parsed = parsePayload(payload);
  } catch (e) {
    return jsonResponse3({ ok: false, error: String(e?.message || e) }, { status: 400 });
  }
  const norm = normalizeAll(parsed);
  const incoming = norm.all;
  const bad = incoming.find((r) => !r.date || !r.issue);
  if (bad) {
    return jsonResponse3({ ok: false, error: "date & issue required for all records" }, { status: 400 });
  }
  try {
    await ensureSoftDeleteColumns(env);
  } catch (e) {
    return jsonResponse3({ ok: false, error: `schema upgrade failed: ${String(e)}` }, { status: 500 });
  }
  const ids = incoming.map((r) => r.id).filter((v) => Number.isFinite(v));
  const existingMap = await fetchExistingUpdatedMap(env, ids);
  const upsert = env.DB.prepare(
    `INSERT INTO tickets (
        id, date, issue, department, name, solution, remarks, type,
        is_deleted, deleted_at, updated_at
     ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, CASE WHEN ?=1 THEN COALESCE(NULLIF(?,''), datetime('now')) ELSE NULL END,
        COALESCE(NULLIF(?,''), datetime('now'))
     )
     ON CONFLICT(id) DO UPDATE SET
        date=excluded.date,
        issue=excluded.issue,
        department=excluded.department,
        name=excluded.name,
        solution=excluded.solution,
        remarks=excluded.remarks,
        type=excluded.type,
        is_deleted=excluded.is_deleted,
        deleted_at=excluded.deleted_at,
        updated_at=excluded.updated_at
     WHERE (?=1) AND COALESCE(excluded.updated_at,'') > COALESCE(tickets.updated_at,'')`
  );
  const BATCH = 90;
  let inserts = 0;
  let updates = 0;
  let skips = 0;
  let skipped_newer_or_equal = 0;
  for (let i = 0; i < incoming.length; i += BATCH) {
    const chunk = incoming.slice(i, i + BATCH);
    const stmts = [];
    for (const r of chunk) {
      const prev = r.id != null ? existingMap.get(r.id) : null;
      const hasUpd = r.has_updated_at ? 1 : 0;
      stmts.push(
        upsert.bind(
          r.id,
          r.date,
          r.issue,
          r.department,
          r.name,
          r.solution,
          r.remarks,
          r.type,
          r.is_deleted,
          r.is_deleted,
          r.deleted_at,
          r.updated_at,
          hasUpd
        )
      );
      if (r.id == null || !existingMap.has(r.id)) {
        inserts++;
        if (r.id != null) existingMap.set(r.id, r.updated_at || "");
      } else if (hasUpd && String(r.updated_at || "") > String(prev || "")) {
        updates++;
        existingMap.set(r.id, r.updated_at);
      } else {
        skips++;
        skipped_newer_or_equal++;
      }
    }
    try {
      await env.DB.batch(stmts);
    } catch (e) {
      return jsonResponse3({ ok: false, error: `import apply failed: ${String(e)}` }, { status: 500 });
    }
  }
  return jsonResponse3({
    ok: true,
    totals: {
      incoming: incoming.length,
      active: norm.active.length,
      trash: norm.trash.length,
      inserts,
      updates,
      skips,
      skipped_newer_or_equal
    }
  });
}
__name(onRequestPost, "onRequestPost");
__name2(onRequestPost, "onRequestPost");
function jsonResponse4(data, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store",
      ...headers
    }
  });
}
__name(jsonResponse4, "jsonResponse4");
__name2(jsonResponse4, "jsonResponse");
function getEditKeyFromRequest4(request) {
  const url = new URL(request.url);
  return request.headers.get("X-EDIT-KEY") || request.headers.get("x-edit-key") || url.searchParams.get("key") || "";
}
__name(getEditKeyFromRequest4, "getEditKeyFromRequest4");
__name2(getEditKeyFromRequest4, "getEditKeyFromRequest");
function requireEditKey4(request, env) {
  const expected = String(env.EDIT_KEY || "");
  if (!expected) {
    return new Response("Server misconfigured: EDIT_KEY is not set", { status: 500 });
  }
  const provided = getEditKeyFromRequest4(request);
  if (provided !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}
__name(requireEditKey4, "requireEditKey4");
__name2(requireEditKey4, "requireEditKey");
function pickFirstNonEmptyArray2(...arrs) {
  for (const a of arrs) {
    if (Array.isArray(a) && a.length > 0) return a;
  }
  for (const a of arrs) {
    if (Array.isArray(a)) return a;
  }
  return [];
}
__name(pickFirstNonEmptyArray2, "pickFirstNonEmptyArray2");
__name2(pickFirstNonEmptyArray2, "pickFirstNonEmptyArray");
function parsePayload2(payload) {
  if (Array.isArray(payload)) {
    return { active: payload, trash: [] };
  }
  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.active) || Array.isArray(payload.trash)) {
      return {
        active: Array.isArray(payload.active) ? payload.active : [],
        trash: Array.isArray(payload.trash) ? payload.trash : []
      };
    }
    const active = pickFirstNonEmptyArray2(payload.records, payload.data, payload.tickets, payload.items);
    const trash = pickFirstNonEmptyArray2(payload.deleted, payload.recycle_bin);
    return { active, trash };
  }
  return null;
}
__name(parsePayload2, "parsePayload2");
__name2(parsePayload2, "parsePayload");
function normalizeRecord2(r, forcedDeleted = null) {
  const obj = r && typeof r === "object" ? r : {};
  const idNum = Number(obj.id ?? obj.ID ?? obj.Id);
  const id = Number.isFinite(idNum) ? idNum : null;
  const updatedAt = String(obj.updated_at ?? obj.updatedAt ?? "").trim();
  const isDeletedRaw = Number(obj.is_deleted ?? obj.isDeleted ?? obj.__is_deleted ?? 0) ? 1 : 0;
  const is_deleted = forcedDeleted === null ? isDeletedRaw : forcedDeleted;
  const deletedAtRaw = String(obj.deleted_at ?? obj.deletedAt ?? "").trim();
  const deleted_at = is_deleted ? deletedAtRaw : "";
  return {
    id,
    date: String(obj.date ?? "").trim(),
    issue: String(obj.issue ?? "").trim(),
    department: String(obj.department ?? ""),
    name: String(obj.name ?? ""),
    solution: String(obj.solution ?? ""),
    remarks: String(obj.remarks ?? ""),
    type: String(obj.type ?? ""),
    updated_at: updatedAt,
    is_deleted,
    deleted_at
  };
}
__name(normalizeRecord2, "normalizeRecord2");
__name2(normalizeRecord2, "normalizeRecord");
function normalizeAll2(parsed) {
  const active = (parsed?.active || []).map((r) => normalizeRecord2(r, 0));
  const trash = (parsed?.trash || []).map((r) => normalizeRecord2(r, 1));
  const all = [...active, ...trash].map((r) => {
    if (parsed?.trash && parsed?.trash.length) return r;
    return r;
  });
  return {
    active,
    trash,
    all
  };
}
__name(normalizeAll2, "normalizeAll2");
__name2(normalizeAll2, "normalizeAll");
async function fetchExistingMap(env, ids) {
  const map = /* @__PURE__ */ new Map();
  if (!ids.length) return map;
  const CHUNK = 900;
  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = ids.slice(i, i + CHUNK);
    const placeholders = chunk.map(() => "?").join(",");
    const sql = `SELECT id, updated_at FROM tickets WHERE id IN (${placeholders})`;
    const { results } = await env.DB.prepare(sql).bind(...chunk).all();
    for (const row of results || []) {
      map.set(Number(row.id), String(row.updated_at ?? "").trim());
    }
  }
  return map;
}
__name(fetchExistingMap, "fetchExistingMap");
__name2(fetchExistingMap, "fetchExistingMap");
async function onRequestPost2({ request, env }) {
  const auth = requireEditKey4(request, env);
  if (auth) return auth;
  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse4({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = parsePayload2(payload);
  if (!parsed) {
    return jsonResponse4({ ok: false, error: "Expected an array or {active,trash}" }, { status: 400 });
  }
  const norm = normalizeAll2(parsed);
  const incoming = norm.all;
  const ids = [...new Set(incoming.map((r) => r.id).filter((id) => Number.isFinite(id)))];
  const existingMap = await fetchExistingMap(env, ids);
  let inserts = 0;
  let updates = 0;
  let skips = 0;
  let skipped_newer_or_equal = 0;
  for (const r of incoming) {
    if (!Number.isFinite(r.id)) {
      inserts++;
      continue;
    }
    const existingUpdatedAt = existingMap.get(r.id);
    if (existingUpdatedAt === void 0) {
      inserts++;
      continue;
    }
    const hasIncomingUpdatedAt = !!r.updated_at;
    if (!hasIncomingUpdatedAt) {
      skips++;
      skipped_newer_or_equal++;
      continue;
    }
    if (r.updated_at > (existingUpdatedAt || "")) {
      updates++;
    } else {
      skips++;
      skipped_newer_or_equal++;
    }
  }
  return jsonResponse4({
    ok: true,
    totals: {
      incoming: incoming.length,
      active: norm.active.length,
      trash: norm.trash.length,
      inserts,
      updates,
      skips,
      skipped_newer_or_equal
    }
  });
}
__name(onRequestPost2, "onRequestPost2");
__name2(onRequestPost2, "onRequestPost");
function jsonResponse5(data, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store",
      ...headers
    }
  });
}
__name(jsonResponse5, "jsonResponse5");
__name2(jsonResponse5, "jsonResponse");
function getEditKeyFromRequest5(request) {
  const url = new URL(request.url);
  return request.headers.get("X-EDIT-KEY") || request.headers.get("x-edit-key") || url.searchParams.get("key") || "";
}
__name(getEditKeyFromRequest5, "getEditKeyFromRequest5");
__name2(getEditKeyFromRequest5, "getEditKeyFromRequest");
function requireEditKey5(request, env) {
  const expected = String(env.EDIT_KEY || "");
  if (!expected) {
    return new Response("Server misconfigured: EDIT_KEY is not set", { status: 500 });
  }
  const provided = getEditKeyFromRequest5(request);
  if (provided !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}
__name(requireEditKey5, "requireEditKey5");
__name2(requireEditKey5, "requireEditKey");
function parseId3(raw) {
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}
__name(parseId3, "parseId3");
__name2(parseId3, "parseId");
async function getTicket(env, id) {
  const r = await env.DB.prepare("SELECT * FROM tickets WHERE id=? LIMIT 1").bind(id).all();
  return r?.results && r.results[0] ? r.results[0] : null;
}
__name(getTicket, "getTicket");
__name2(getTicket, "getTicket");
function isDeletedRow(row) {
  return Number(row?.is_deleted ?? 0) === 1;
}
__name(isDeletedRow, "isDeletedRow");
__name2(isDeletedRow, "isDeletedRow");
async function onRequestPut2({ params, request, env }) {
  const auth = requireEditKey5(request, env);
  if (auth) return auth;
  const id = parseId3(params.id);
  if (id === null) return jsonResponse5({ ok: false, error: "bad id" }, { status: 400 });
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse5({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const date = String(body?.date ?? "").trim();
  const issue = String(body?.issue ?? "").trim();
  if (!date || !issue) {
    return jsonResponse5({ ok: false, error: "date & issue required" }, { status: 400 });
  }
  const department = String(body?.department ?? "");
  const name = String(body?.name ?? "");
  const solution = String(body?.solution ?? "");
  const remarks = String(body?.remarks ?? "");
  const type = String(body?.type ?? "");
  const force = !!body?.force;
  const clientUpdatedAt = String(body?.updated_at ?? body?.updatedAt ?? "");
  let current = null;
  try {
    current = await getTicket(env, id);
  } catch {
    current = null;
  }
  if (!current) {
    return jsonResponse5({ ok: false, error: "not_found" }, { status: 404 });
  }
  if (isDeletedRow(current)) {
    return jsonResponse5({ ok: false, error: "deleted" }, { status: 410 });
  }
  const currentUpdatedAt = String(current?.updated_at ?? "");
  if (!force && !clientUpdatedAt) {
    return jsonResponse5(
      { ok: false, error: "missing_version", hint: "send updated_at for concurrency control" },
      { status: 400 }
    );
  }
  try {
    const stmt = force ? env.DB.prepare(
      `UPDATE tickets
           SET date=?, issue=?, department=?, name=?, solution=?, remarks=?, type=?,
               updated_at=datetime('now')
           WHERE id=? AND is_deleted=0`
    ).bind(date, issue, department, name, solution, remarks, type, id) : env.DB.prepare(
      `UPDATE tickets
           SET date=?, issue=?, department=?, name=?, solution=?, remarks=?, type=?,
               updated_at=datetime('now')
           WHERE id=? AND is_deleted=0 AND updated_at=?`
    ).bind(date, issue, department, name, solution, remarks, type, id, clientUpdatedAt);
    const r = await stmt.run();
    const changes = Number(r?.meta?.changes ?? 0);
    if (changes === 0 && !force) {
      const latest2 = await getTicket(env, id);
      return jsonResponse5(
        {
          ok: false,
          error: "conflict",
          current: latest2 ?? current,
          client_updated_at: clientUpdatedAt,
          server_updated_at: String((latest2 ?? current)?.updated_at ?? currentUpdatedAt)
        },
        { status: 409 }
      );
    }
    const latest = await getTicket(env, id);
    return jsonResponse5({ ok: true, updated_at: String(latest?.updated_at ?? "") });
  } catch (e) {
    const stmt = !force && clientUpdatedAt ? env.DB.prepare(
      `UPDATE tickets
           SET date=?, issue=?, department=?, name=?, solution=?, remarks=?, type=?,
               updated_at=datetime('now')
           WHERE id=? AND updated_at=?`
    ).bind(date, issue, department, name, solution, remarks, type, id, clientUpdatedAt) : env.DB.prepare(
      `UPDATE tickets
           SET date=?, issue=?, department=?, name=?, solution=?, remarks=?, type=?,
               updated_at=datetime('now')
           WHERE id=?`
    ).bind(date, issue, department, name, solution, remarks, type, id);
    const r = await stmt.run();
    const changes = Number(r?.meta?.changes ?? 0);
    if (changes === 0 && !force && clientUpdatedAt) {
      const latest2 = await getTicket(env, id);
      return jsonResponse5(
        {
          ok: false,
          error: "conflict",
          current: latest2 ?? current,
          client_updated_at: clientUpdatedAt,
          server_updated_at: String((latest2 ?? current)?.updated_at ?? currentUpdatedAt)
        },
        { status: 409 }
      );
    }
    const latest = await getTicket(env, id);
    return jsonResponse5({ ok: true, updated_at: String(latest?.updated_at ?? "") });
  }
}
__name(onRequestPut2, "onRequestPut2");
__name2(onRequestPut2, "onRequestPut");
async function onRequestDelete2({ params, request, env }) {
  const auth = requireEditKey5(request, env);
  if (auth) return auth;
  const id = parseId3(params.id);
  if (id === null) return jsonResponse5({ ok: false, error: "bad id" }, { status: 400 });
  try {
    const r = await env.DB.prepare(
      `UPDATE tickets
         SET is_deleted=1,
             deleted_at=datetime('now'),
             updated_at=datetime('now')
         WHERE id=? AND is_deleted=0`
    ).bind(id).run();
    const changes = Number(r?.meta?.changes ?? 0);
    if (changes === 0) {
      const latest = await getTicket(env, id);
      if (!latest) return jsonResponse5({ ok: false, error: "not_found" }, { status: 404 });
      if (isDeletedRow(latest)) return jsonResponse5({ ok: true, already: true, soft: true });
      return jsonResponse5({ ok: false, error: "delete_failed" }, { status: 500 });
    }
    return jsonResponse5({ ok: true, soft: true });
  } catch (e) {
    await env.DB.prepare("DELETE FROM tickets WHERE id=?").bind(id).run();
    return jsonResponse5({ ok: true, soft: false });
  }
}
__name(onRequestDelete2, "onRequestDelete2");
__name2(onRequestDelete2, "onRequestDelete");
function getEditKeyFromRequest6(request) {
  const url = new URL(request.url);
  return request.headers.get("X-EDIT-KEY") || request.headers.get("x-edit-key") || url.searchParams.get("key") || "";
}
__name(getEditKeyFromRequest6, "getEditKeyFromRequest6");
__name2(getEditKeyFromRequest6, "getEditKeyFromRequest");
function requireEditKey6(request, env) {
  const expected = String(env.EDIT_KEY || "");
  if (!expected) {
    return new Response("Server misconfigured: EDIT_KEY is not set", { status: 500 });
  }
  const provided = getEditKeyFromRequest6(request);
  if (provided !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}
__name(requireEditKey6, "requireEditKey6");
__name2(requireEditKey6, "requireEditKey");
async function onRequestGet({ request, env }) {
  const denied = requireEditKey6(request, env);
  if (denied) return denied;
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store"
    }
  });
}
__name(onRequestGet, "onRequestGet");
__name2(onRequestGet, "onRequestGet");
function jsonResponse6(data, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store",
      ...headers
    }
  });
}
__name(jsonResponse6, "jsonResponse6");
__name2(jsonResponse6, "jsonResponse");
function getEditKeyFromRequest7(request) {
  const url = new URL(request.url);
  return request.headers.get("X-EDIT-KEY") || request.headers.get("x-edit-key") || url.searchParams.get("key") || "";
}
__name(getEditKeyFromRequest7, "getEditKeyFromRequest7");
__name2(getEditKeyFromRequest7, "getEditKeyFromRequest");
function requireEditKey7(request, env) {
  const expected = String(env.EDIT_KEY || "");
  if (!expected) {
    return new Response("Server misconfigured: EDIT_KEY is not set", { status: 500 });
  }
  const provided = getEditKeyFromRequest7(request);
  if (provided !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}
__name(requireEditKey7, "requireEditKey7");
__name2(requireEditKey7, "requireEditKey");
function pickFirstNonEmptyArray3(...arrs) {
  for (const a of arrs) {
    if (Array.isArray(a) && a.length > 0) return a;
  }
  for (const a of arrs) {
    if (Array.isArray(a)) return a;
  }
  return [];
}
__name(pickFirstNonEmptyArray3, "pickFirstNonEmptyArray3");
__name2(pickFirstNonEmptyArray3, "pickFirstNonEmptyArray");
async function onRequestPut3({ request, env }) {
  const auth = requireEditKey7(request, env);
  if (auth) return auth;
  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse6({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  let active = [];
  let trash = [];
  if (Array.isArray(payload)) {
    active = payload;
  } else if (payload && typeof payload === "object") {
    active = pickFirstNonEmptyArray3(payload.active, payload.records, payload.data, payload.tickets);
    trash = pickFirstNonEmptyArray3(payload.trash, payload.deleted, payload.recycle_bin);
  } else {
    return jsonResponse6({ ok: false, error: "Expected an array or {active,trash}" }, { status: 400 });
  }
  const all = [];
  for (const r of active) all.push({ ...r, __is_deleted: 0 });
  for (const r of trash) all.push({ ...r, __is_deleted: 1 });
  await env.DB.prepare("DELETE FROM tickets").run();
  const insertNew = env.DB.prepare(
    `INSERT INTO tickets (
        id, date, issue, department, name, solution, remarks, type,
        is_deleted, deleted_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertOld = env.DB.prepare(
    `INSERT INTO tickets (id, date, issue, department, name, solution, remarks, type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const BATCH = 100;
  let inserted = 0;
  let usedNew = true;
  for (let i = 0; i < all.length; i += BATCH) {
    const chunk = all.slice(i, i + BATCH);
    try {
      const stmts = chunk.map((r) => {
        const id = Number(r?.id);
        const safeId = Number.isFinite(id) ? id : null;
        const date = String(r?.date ?? "").trim();
        const issue = String(r?.issue ?? "").trim();
        const isDeleted = Number(r?.is_deleted ?? r?.isDeleted ?? r?.__is_deleted ?? 0) ? 1 : 0;
        const deletedAt = r?.deleted_at ?? r?.deletedAt ?? (isDeleted ? r?.deleted_at || null : null);
        const updatedAt = r?.updated_at ?? r?.updatedAt ?? null;
        return insertNew.bind(
          safeId,
          date,
          issue,
          String(r?.department ?? ""),
          String(r?.name ?? ""),
          String(r?.solution ?? ""),
          String(r?.remarks ?? ""),
          String(r?.type ?? ""),
          isDeleted,
          deletedAt,
          updatedAt
        );
      });
      await env.DB.batch(stmts);
      inserted += chunk.length;
    } catch (e) {
      usedNew = false;
      const stmts = chunk.map((r) => {
        const id = Number(r?.id);
        const safeId = Number.isFinite(id) ? id : null;
        const date = String(r?.date ?? "").trim();
        const issue = String(r?.issue ?? "").trim();
        return insertOld.bind(
          safeId,
          date,
          issue,
          String(r?.department ?? ""),
          String(r?.name ?? ""),
          String(r?.solution ?? ""),
          String(r?.remarks ?? ""),
          String(r?.type ?? "")
        );
      });
      await env.DB.batch(stmts);
      inserted += chunk.length;
    }
  }
  return jsonResponse6({ ok: true, inserted, mode: usedNew ? "new_schema" : "old_schema" });
}
__name(onRequestPut3, "onRequestPut3");
__name2(onRequestPut3, "onRequestPut");
function jsonResponse7(data, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store",
      ...headers
    }
  });
}
__name(jsonResponse7, "jsonResponse7");
__name2(jsonResponse7, "jsonResponse");
function getEditKeyFromRequest8(request) {
  const url = new URL(request.url);
  return request.headers.get("X-EDIT-KEY") || request.headers.get("x-edit-key") || url.searchParams.get("key") || "";
}
__name(getEditKeyFromRequest8, "getEditKeyFromRequest8");
__name2(getEditKeyFromRequest8, "getEditKeyFromRequest");
function requireEditKey8(request, env) {
  const expected = String(env.EDIT_KEY || "");
  if (!expected) {
    return new Response("Server misconfigured: EDIT_KEY is not set", { status: 500 });
  }
  const provided = getEditKeyFromRequest8(request);
  if (provided !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}
__name(requireEditKey8, "requireEditKey8");
__name2(requireEditKey8, "requireEditKey");
async function onRequestGet2({ request, env }) {
  const url = new URL(request.url);
  const trash = ["1", "true", "yes"].includes(String(url.searchParams.get("trash") || "").toLowerCase());
  const sql = trash ? "SELECT * FROM tickets WHERE is_deleted=1 ORDER BY deleted_at DESC, id DESC" : "SELECT * FROM tickets WHERE is_deleted=0 ORDER BY date DESC, id DESC";
  try {
    const { results } = await env.DB.prepare(sql).all();
    return jsonResponse7(results ?? []);
  } catch (e) {
    const { results } = await env.DB.prepare("SELECT * FROM tickets ORDER BY date DESC, id DESC").all();
    return jsonResponse7(results ?? []);
  }
}
__name(onRequestGet2, "onRequestGet2");
__name2(onRequestGet2, "onRequestGet");
async function onRequestPost3({ request, env }) {
  const auth = requireEditKey8(request, env);
  if (auth) return auth;
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse7({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const date = String(body?.date ?? "").trim();
  const issue = String(body?.issue ?? "").trim();
  if (!date || !issue) {
    return jsonResponse7({ ok: false, error: "date & issue required" }, { status: 400 });
  }
  const department = String(body?.department ?? "");
  const name = String(body?.name ?? "");
  const solution = String(body?.solution ?? "");
  const remarks = String(body?.remarks ?? "");
  const type = String(body?.type ?? "");
  const r = await env.DB.prepare(
    `INSERT INTO tickets (date, issue, department, name, solution, remarks, type)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(date, issue, department, name, solution, remarks, type).run();
  return jsonResponse7({ ok: true, id: r?.meta?.last_row_id ?? null }, { status: 201 });
}
__name(onRequestPost3, "onRequestPost3");
__name2(onRequestPost3, "onRequestPost");
var routes = [
  {
    routePath: "/api/tickets/:id/hard",
    mountPath: "/api/tickets/:id",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete]
  },
  {
    routePath: "/api/tickets/:id/restore",
    mountPath: "/api/tickets/:id",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut]
  },
  {
    routePath: "/api/import/apply",
    mountPath: "/api/import",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/import/preview",
    mountPath: "/api/import",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/tickets/:id",
    mountPath: "/api/tickets",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete2]
  },
  {
    routePath: "/api/tickets/:id",
    mountPath: "/api/tickets",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut2]
  },
  {
    routePath: "/api/auth-test",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/import",
    mountPath: "/api",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut3]
  },
  {
    routePath: "/api/tickets",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/tickets",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// C:/Users/clbk.it/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-dev-util.ts
function isRoutingRuleMatch(pathname, routingRule) {
  if (!pathname) {
    throw new Error("Pathname is undefined.");
  }
  if (!routingRule) {
    throw new Error("Routing rule is undefined.");
  }
  const ruleRegExp = transformRoutingRuleToRegExp(routingRule);
  return pathname.match(ruleRegExp) !== null;
}
__name(isRoutingRuleMatch, "isRoutingRuleMatch");
function transformRoutingRuleToRegExp(rule) {
  let transformedRule;
  if (rule === "/" || rule === "/*") {
    transformedRule = rule;
  } else if (rule.endsWith("/*")) {
    transformedRule = `${rule.substring(0, rule.length - 2)}(/*)?`;
  } else if (rule.endsWith("/")) {
    transformedRule = `${rule.substring(0, rule.length - 1)}(/)?`;
  } else if (rule.endsWith("*")) {
    transformedRule = rule;
  } else {
    transformedRule = `${rule}(/)?`;
  }
  transformedRule = `^${transformedRule.replaceAll(/\./g, "\\.").replaceAll(/\*/g, ".*")}$`;
  return new RegExp(transformedRule);
}
__name(transformRoutingRuleToRegExp, "transformRoutingRuleToRegExp");

// .wrangler/tmp/pages-rHAl5e/wsqtf6tmck.js
var define_ROUTES_default = { version: 1, include: ["/*"], exclude: [] };
var routes2 = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes2.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env.ASSETS.fetch(request);
      }
    }
    for (const include of routes2.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        const workerAsHandler = middleware_loader_entry_default;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};

// C:/Users/clbk.it/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// C:/Users/clbk.it/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-i4xbv5/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = pages_dev_pipeline_default;

// C:/Users/clbk.it/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-i4xbv5/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=wsqtf6tmck.js.map
