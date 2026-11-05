/* Бот уведомлений Табель ANK. Запускается по расписанию в GitHub Actions (каждые 15 минут):
   неявка утром, нет «Уехал» вечером, опоздания, новые сообщения рабочих, утренний и вечерний итог.
   Отправляет Web Push в кабинет и сообщения в Telegram. Читает Firestore анонимно (ключ публичный). */
import webpush from "web-push";

const FB_KEY = "AIzaSyDfVV7s3V6Eo4C9_dN9vDuTP69W6xFT3xk";
const PROJECT = "fresh-mason-513619-s1";
const SITE = "https://1vikinginua-ops.github.io/tabel-ank/";
const VAPID_PUBLIC = process.env.VAPID_PUBLIC || "BEJLH5owagGWxVvyxDLemc40hBQcJFC_WL_5Q-OxnCjzfMfMIhgJBRuYPSWS11uxqM8fYj5ROfuRaB9FsMwtRXk";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE || "";
const TG = process.env.TELEGRAM_TOKEN || "";
const TZ = "Europe/Madrid";
const ROOT = `projects/${PROJECT}/databases/(default)/documents`;
const BASE = `https://firestore.googleapis.com/v1/${ROOT}`;
const H = { "Content-Type": "application/json", Referer: SITE };

/* ---------- Firestore ---------- */
const enc = v => v === null || v === undefined ? { nullValue: null } : typeof v === "boolean" ? { booleanValue: v } : typeof v === "number" ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v }) : typeof v === "string" ? { stringValue: v } : Array.isArray(v) ? { arrayValue: { values: v.map(enc) } } : { mapValue: { fields: encF(v) } };
const encF = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined).map(([k, v]) => [k, enc(v)]));
const dec = v => !v ? null : "stringValue" in v ? v.stringValue : "integerValue" in v ? Number(v.integerValue) : "doubleValue" in v ? v.doubleValue : "booleanValue" in v ? v.booleanValue : "arrayValue" in v ? (v.arrayValue.values || []).map(dec) : "mapValue" in v ? decF(v.mapValue.fields || {}) : null;
const decF = f => Object.fromEntries(Object.entries(f || {}).map(([k, v]) => [k, dec(v)]));
let token = "";
async function j(url, opt = {}) { const r = await fetch(url, { ...opt, headers: { ...H, ...(opt.headers || {}), ...(token ? { Authorization: "Bearer " + token } : {}) } }); const t = await r.text(); let b = {}; try { b = JSON.parse(t) } catch {} if (!r.ok) throw new Error(`${r.status} ${url.slice(0, 80)} ${t.slice(0, 200)}`); return b }
async function auth() { const b = await j(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FB_KEY}`, { method: "POST", body: JSON.stringify({ returnSecureToken: true }) }); token = b.idToken }
const get = async p => { try { const d = await j(`${BASE}/${p}`); return decF(d.fields) } catch (e) { if (/^404/.test(e.message)) return null; throw e } };
const list = async c => ((await j(`${BASE}/${c}?pageSize=300`)).documents || []).map(d => ({ id: d.name.slice(d.name.lastIndexOf("/") + 1), ...decF(d.fields) }));
const batchGet = async paths => paths.length ? (await j(`${BASE}:batchGet`, { method: "POST", body: JSON.stringify({ documents: paths.map(p => `${ROOT}/${p}`) }) })).filter(x => x.found).map(x => ({ id: x.found.name.slice(x.found.name.lastIndexOf("/") + 1), ...decF(x.found.fields) })) : [];
const set = (p, d) => j(`${BASE}/${p}`, { method: "PATCH", body: JSON.stringify({ fields: encF(d) }) });
const del = p => j(`${BASE}/${p}`, { method: "DELETE" }).catch(() => {});

/* ---------- время и табель ---------- */
const pad = n => String(n).padStart(2, "0");
function nowParts() { const d = process.env.ANK_NOW ? new Date(process.env.ANK_NOW) : new Date(); const f = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short" }); const p = Object.fromEntries(f.formatToParts(d).map(x => [x.type, x.value])); const hm = Number(p.hour === "24" ? 0 : p.hour) * 60 + Number(p.minute); return { date: `${p.year}-${p.month}-${p.day}`, hm, wd: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday) } }
const toMin = t => { if (!t) return null; const [h, m] = t.split(":").map(Number); return h * 60 + m };
const fmt = m => `${Math.floor(m / 60)}:${pad(m % 60)}`;
const mins = e => { const s = toMin(e.start), f = toMin(e.end); return s == null || f == null ? 0 : Math.max(0, f - s - (Number(e.breakMin) || 0)) };
const first = n => String(n || "").split(" ")[0];

/* ---------- отправка ---------- */
async function sendPush(subs, kind, title, body, url) {
  if (!VAPID_PRIVATE || VAPID_PUBLIC.startsWith("__")) return 0;
  webpush.setVapidDetails("mailto:info@ank-valencia.es", VAPID_PUBLIC, VAPID_PRIVATE);
  let n = 0;
  for (const s of subs) {
    if (s.prefs && s.prefs[kind] === false) continue;
    try { await webpush.sendNotification(s.sub, JSON.stringify({ title, body, url: url || SITE + "boss.html", tag: kind })); n++ }
    catch (e) { if (e.statusCode === 404 || e.statusCode === 410) await del(`push/${s.id}`); else console.log("push err", e.statusCode, e.body?.slice?.(0, 100)) }
  }
  return n;
}
async function sendTg(chats, kind, text) {
  if (!TG) return 0; let n = 0;
  for (const c of chats) {
    if (!c.ok) continue; if (c.prefs && c.prefs[kind] === false) continue;
    try { await j(`https://api.telegram.org/bot${TG}/sendMessage`, { method: "POST", body: JSON.stringify({ chat_id: c.id, text, parse_mode: "HTML", disable_web_page_preview: true }) }); n++ }
    catch (e) { console.log("tg err", e.message.slice(0, 120)); if (/403/.test(e.message)) await del(`tg/${c.id}`) }
  }
  return n;
}
async function tgUpdates(state, chats) {
  if (!TG) return;
  let b; try { b = await j(`https://api.telegram.org/bot${TG}/getUpdates?offset=${(state.tgOffset || 0) + 1}&timeout=0`) } catch (e) { console.log("getUpdates", e.message.slice(0, 100)); return }
  for (const u of b.result || []) {
    state.tgOffset = Math.max(state.tgOffset || 0, u.update_id);
    const m = u.message || u.edited_message; if (!m || !m.chat) continue;
    const id = String(m.chat.id), known = chats.find(c => c.id === id);
    const name = [m.chat.first_name, m.chat.last_name].filter(Boolean).join(" ") || m.chat.title || id, user = m.chat.username || "";
    if (!known) { await set(`tg/${id}`, { name, user, ts: Date.now(), ok: false }); chats.push({ id, name, user, ok: false }); await sendTg([{ id, ok: true }], "x", "Заявка отправлена руководителю. Как только её одобрят в кабинете (Настройки → Уведомления), сюда будут приходить сообщения Табеля ANK.") }
    else if (known.ok && /^\/(start|status|сегодня)/i.test(m.text || "")) known.wantStatus = true;
    else if (!known.ok) await sendTg([{ id, ok: true }], "x", "Заявка ещё не одобрена. Попросите руководителя открыть кабинет → Настройки → Уведомления.");
  }
}

/* ---------- основной цикл ---------- */
async function main() {
  await auth();
  const [cfgD, wl, stateD, tgs, pushes] = await Promise.all([get("cab/cfg"), get("cab/workers"), get("bot/state"), list("tg"), list("push")]);
  const cfg = { start: "08:00", grace: 15, norm: 8, digest: "21:00", morning: "09:30", noout: "20:00", ...(cfgD || {}) };
  const workers = (wl && wl.list) || [];
  const state = { sent: {}, ...(stateD || {}) };
  const now = nowParts(), today = now.date, weekday = now.wd >= 1 && now.wd <= 5;
  const late = toMin(cfg.start) + Number(cfg.grace || 0), noinAt = late + 30, nooutAt = toMin(cfg.noout || "20:00"), morningAt = toMin(cfg.morning || "09:30"), eveningAt = toMin(cfg.digest || "21:00");
  console.log("now", today, fmt(now.hm), "workers", workers.length, "tg", tgs.length, "push", pushes.length);
  await tgUpdates(state, tgs);

  const ledgers = await batchGet(workers.map(w => `workers/${w.id}`));
  const L = {}; for (const d of ledgers) { try { const x = JSON.parse(d.json || ""); if (x && x.app === "tabel-ank-ledger") L[d.id] = x } catch {} }
  const rows = workers.map(w => { const l = L[w.id]; const e = l && (l.days || []).find(x => x.date === today); return { w, l, e, name: w.name || (l && l.name) || "Рабочий" } });

  const alerts = []; // {key, kind, title, body}
  const once = (key, kind, title, body) => { if (state.sent[key]) return; alerts.push({ key, kind, title, body }) };
  if (weekday) for (const r of rows) {
    if (!r.l) continue;
    if (!r.e || !r.e.start) { if (now.hm >= noinAt && now.hm < nooutAt) once(`noin:${today}:${r.w.id}`, "noin", `${first(r.name)} не отметился`, `К ${fmt(noinAt)} нет «Приехал». Позвоните или проверьте план.`) }
    else {
      if (toMin(r.e.start) > late) once(`late:${today}:${r.w.id}`, "late", `${first(r.name)} опоздал`, `Приехал в ${r.e.start}${r.e.place ? " · " + r.e.place : ""}`);
      if (!r.e.end && now.hm >= nooutAt) once(`noout:${today}:${r.w.id}`, "noout", `${first(r.name)}: нет «Уехал»`, `Смена с ${r.e.start} не закрыта${r.e.place ? " · " + r.e.place : ""}. Часы не посчитаются.`);
    }
  }
  /* новые сообщения */
  const since = state.lastEventTs || (Date.now() - 2 * 3600e3);
  let events = []; try { events = (await list("events")).filter(e => (e.ts || 0) > since).sort((a, b) => a.ts - b.ts) } catch (e) { console.log("events", e.message.slice(0, 80)) }
  for (const e of events) {
    const who = first(e.name || (workers.find(w => w.id === e.uid) || {}).name);
    const t = e.t === "late" ? `опаздывает${e.min ? " ~" + (e.min >= 60 ? e.min / 60 + " ч" : e.min + " мин") : ""}` : e.t === "material" ? "нужен материал" : e.t === "early" ? "закончил раньше" : e.t === "voice" ? "голосовое сообщение" : e.t === "expense" ? `расход ${e.sum} € (${e.cat || ""})` : e.t;
    once(`ev:${e.id}`, "msg", `${who}: ${t}`, `${e.text || ""}${e.place ? " · " + e.place : ""}`.trim() || "Откройте «Сообщения» в кабинете");
    state.lastEventTs = Math.max(state.lastEventTs || 0, e.ts || 0);
  }
  /* утренний и вечерний итог */
  const onsite = rows.filter(r => r.e && r.e.start && !r.e.end), done = rows.filter(r => r.e && r.e.end), none = rows.filter(r => r.l && !(r.e && r.e.start));
  if (weekday && now.hm >= morningAt && now.hm < morningAt + 45) once(`morning:${today}`, "morning", `Утро: на объектах ${onsite.length + done.length} из ${rows.length}`, (onsite.length ? "На объекте: " + onsite.map(r => `${first(r.name)} (${r.e.place || "?"}, с ${r.e.start})`).join(", ") + ". " : "") + (none.length ? "Не отметились: " + none.map(r => first(r.name)).join(", ") + "." : "Все отметились."));
  if (now.hm >= eveningAt && now.hm < eveningAt + 45) { const tot = done.reduce((a, r) => a + mins(r.e), 0); once(`evening:${today}`, "evening", `Итог дня: ${fmt(tot)} ч, смен ${done.length}`, (done.map(r => `${first(r.name)} ${fmt(mins(r.e))}`).join(", ") || "Закрытых смен нет") + (onsite.length ? ". Без «Уехал»: " + onsite.map(r => first(r.name)).join(", ") : "") + (none.length && weekday ? ". Не выходили: " + none.map(r => first(r.name)).join(", ") : "")) }
  /* статус по запросу в Telegram */
  for (const c of tgs.filter(c => c.wantStatus)) await sendTg([c], "x", `<b>${today} ${fmt(now.hm)}</b>\nНа объекте: ${onsite.map(r => `${first(r.name)} (${r.e.place || "?"})`).join(", ") || "никого"}\nЗакончили: ${done.map(r => `${first(r.name)} ${fmt(mins(r.e))}`).join(", ") || "—"}\nНе отметились: ${none.map(r => first(r.name)).join(", ") || "—"}`);

  let sentPush = 0, sentTg = 0;
  for (const a of alerts) {
    sentPush += await sendPush(pushes, a.kind, a.title, a.body, SITE + "boss.html" + (a.kind === "msg" ? "#v=inbox" : ""));
    sentTg += await sendTg(tgs, a.kind, `<b>${a.title}</b>\n${a.body}`);
    state.sent[a.key] = Date.now();
  }
  const cut = Date.now() - 3 * 86400e3; for (const k of Object.keys(state.sent)) if (state.sent[k] < cut) delete state.sent[k];
  state.lastRun = Date.now(); state.lastRunText = `${today} ${fmt(now.hm)}`;
  await set("bot/state", state);
  console.log(`alerts ${alerts.length}: ${alerts.map(a => a.key).join(", ") || "—"} | push ${sentPush} | telegram ${sentTg}`);
}
main().catch(e => { console.error(e); process.exit(1) });
