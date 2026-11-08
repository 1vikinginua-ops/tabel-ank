/* Бот уведомлений Табель ANK. Запускается по расписанию в GitHub Actions (каждые 15 минут):
   неявка утром, нет «Уехал» вечером, опоздания, новые сообщения рабочих, утренний и вечерний итог,
   рассылки рабочим (push / Telegram / WhatsApp), письма и WhatsApp клиентам (очередь mailq, автонапоминания о счетах),
   недельный email-отчёт. Входит в Firestore как служебный аккаунт бота (BOT_PASSWORD в секретах GitHub);
   без секрета — анонимно, как раньше (тогда часть данных по правилам доступа недоступна). */
import webpush from "web-push";

const FB_KEY = "AIzaSyDfVV7s3V6Eo4C9_dN9vDuTP69W6xFT3xk";
const PROJECT = "fresh-mason-513619-s1";
const SITE = "https://1vikinginua-ops.github.io/tabel-ank/";
const VAPID_PUBLIC = process.env.VAPID_PUBLIC || "BEJLH5owagGWxVvyxDLemc40hBQcJFC_WL_5Q-OxnCjzfMfMIhgJBRuYPSWS11uxqM8fYj5ROfuRaB9FsMwtRXk";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE || "";
const TG = process.env.TELEGRAM_TOKEN || "";
const WA_TOKEN = process.env.WA_TOKEN || "", WA_PHONE_ID = process.env.WA_PHONE_ID || "";
const TZ = "Europe/Madrid";
const BOT_EMAIL = process.env.BOT_EMAIL || "bot@tabel-ank.app", BOT_PW = process.env.BOT_PASSWORD || "";
/* праздники Comunitat Valenciana по умолчанию — те же, что в кабинете (cfg.holidays == null) */
const HOLIDAYS_DEFAULT = "2026-01-01,2026-01-06,2026-01-22,2026-03-19,2026-04-03,2026-04-06,2026-04-13,2026-05-01,2026-06-24,2026-08-15,2026-10-09,2026-10-12,2026-11-02,2026-12-07,2026-12-08,2026-12-25,2027-01-01,2027-01-06,2027-01-22,2027-03-19,2027-03-26,2027-03-29,2027-04-05,2027-05-01,2027-06-24,2027-08-16,2027-10-09,2027-10-12,2027-11-01,2027-12-06,2027-12-08,2027-12-25";
const h = s => String(s ?? "").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const safeUrl = u => String(u).replace(/(api\.telegram\.org\/bot)[^/]+/, "$1***").replace(/key=[^&]+/, "key=…");
const ROOT = `projects/${PROJECT}/databases/(default)/documents`;
const BASE = `https://firestore.googleapis.com/v1/${ROOT}`;
const H = { "Content-Type": "application/json", Referer: SITE };

/* ---------- Firestore ---------- */
const enc = v => v === null || v === undefined ? { nullValue: null } : typeof v === "boolean" ? { booleanValue: v } : typeof v === "number" ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v }) : typeof v === "string" ? { stringValue: v } : Array.isArray(v) ? { arrayValue: { values: v.map(enc) } } : { mapValue: { fields: encF(v) } };
const encF = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined).map(([k, v]) => [k, enc(v)]));
const dec = v => !v ? null : "stringValue" in v ? v.stringValue : "integerValue" in v ? Number(v.integerValue) : "doubleValue" in v ? v.doubleValue : "booleanValue" in v ? v.booleanValue : "arrayValue" in v ? (v.arrayValue.values || []).map(dec) : "mapValue" in v ? decF(v.mapValue.fields || {}) : null;
const decF = f => Object.fromEntries(Object.entries(f || {}).map(([k, v]) => [k, dec(v)]));
let token = "";
async function j(url, opt = {}) { const own = opt.headers && opt.headers.Authorization; const r = await fetch(url, { signal: AbortSignal.timeout(20000), ...opt, headers: { ...H, ...(opt.headers || {}), ...(token && !own ? { Authorization: "Bearer " + token } : {}) } }); const t = await r.text(); let b = {}; try { b = JSON.parse(t) } catch {} if (!r.ok) throw new Error(`${r.status} ${safeUrl(url).slice(0, 90)} ${t.slice(0, 200)}`); return b }
const idp = (m, body) => j(`https://identitytoolkit.googleapis.com/v1/accounts:${m}?key=${FB_KEY}`, { method: "POST", body: JSON.stringify({ ...body, returnSecureToken: true }) });
let authMode = "anon";
async function auth() {
  if (BOT_PW) {
    try { token = (await idp("signInWithPassword", { email: BOT_EMAIL, password: BOT_PW })).idToken; authMode = "bot"; return }
    catch (e) {
      if (/EMAIL_NOT_FOUND|INVALID_LOGIN_CREDENTIALS/.test(e.message)) { try { token = (await idp("signUp", { email: BOT_EMAIL, password: BOT_PW })).idToken; authMode = "bot"; console.log("bot: аккаунт", BOT_EMAIL, "создан"); return } catch (e2) { console.log("bot auth: не удалось войти/создать аккаунт бота —", e2.message.slice(0, 120)) } }
      else console.log("bot auth:", e.message.slice(0, 120));
    }
  } else console.log("bot: секрет BOT_PASSWORD не задан — работаю анонимно (ограниченный доступ)");
  token = (await idp("signUp", {})).idToken;
}
const get = async p => { try { const d = await j(`${BASE}/${p}`); return decF(d.fields) } catch (e) { if (/^404/.test(e.message)) return null; throw e } };
const list = async c => ((await j(`${BASE}/${c}?pageSize=300`)).documents || []).map(d => ({ id: d.name.slice(d.name.lastIndexOf("/") + 1), ...decF(d.fields) }));
const batchGet = async paths => paths.length ? (await j(`${BASE}:batchGet`, { method: "POST", body: JSON.stringify({ documents: paths.map(p => `${ROOT}/${p}`) }) })).filter(x => x.found).map(x => ({ id: x.found.name.slice(x.found.name.lastIndexOf("/") + 1), ...decF(x.found.fields) })) : [];
const set = (p, d) => j(`${BASE}/${p}`, { method: "PATCH", body: JSON.stringify({ fields: encF(d) }) });
const patch = (p, d) => j(`${BASE}/${p}?` + Object.keys(d).map(k => "updateMask.fieldPaths=" + k).join("&"), { method: "PATCH", body: JSON.stringify({ fields: encF(d) }) });
const del = p => j(`${BASE}/${p}`, { method: "DELETE" }).catch(() => {});

/* ---------- время и табель ---------- */
const pad = n => String(n).padStart(2, "0");
function nowParts() { const d = process.env.ANK_NOW ? new Date(process.env.ANK_NOW) : new Date(); const f = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short" }); const p = Object.fromEntries(f.formatToParts(d).map(x => [x.type, x.value])); const hm = Number(p.hour === "24" ? 0 : p.hour) * 60 + Number(p.minute); return { date: `${p.year}-${p.month}-${p.day}`, hm, wd: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday) } }
const toMin = t => { if (!t) return null; const [h, m] = t.split(":").map(Number); return h * 60 + m };
const fmt = m => `${Math.floor(m / 60)}:${pad(m % 60)}`;
const mins = e => { const s = toMin(e.start), f = toMin(e.end); return s == null || f == null ? 0 : Math.max(0, f - s - (Number(e.breakMin) || 0)) };
const first = n => String(n || "").split(" ")[0];

/* ---------- отправка ---------- */
async function sendPush(subs, kind, title, body, url, app) {
  if (!VAPID_PRIVATE || VAPID_PUBLIC.startsWith("__")) return 0;
  webpush.setVapidDetails("mailto:info@ank-valencia.es", VAPID_PUBLIC, VAPID_PRIVATE);
  let n = 0;
  for (const s of subs) {
    if (s.prefs && s.prefs[kind] === false) continue;
    try { await webpush.sendNotification(s.sub, JSON.stringify({ title, body, url: url || SITE + "boss.html", tag: kind, app: app || "boss" })); n++ }
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
/* WhatsApp Cloud API: текст внутри 24-часового окна, иначе — утверждённый шаблон с одним параметром {{1}} */
const phoneNorm = p => { p = String(p || "").replace(/[^\d+]/g, ""); if (!p) return ""; if (p[0] === "+") p = p.slice(1); if (/^[6789]\d{8}$/.test(p)) p = "34" + p; return p };
async function sendWa(phones, text, cfg) {
  if (!WA_TOKEN || !WA_PHONE_ID || !cfg.waOn) return 0; let n = 0;
  const url = `https://graph.facebook.com/v21.0/${WA_PHONE_ID}/messages`, hdr = { Authorization: "Bearer " + WA_TOKEN };
  for (const raw of phones) {
    const to = phoneNorm(raw); if (!to) continue;
    const tpl = cfg.waTemplate ? { messaging_product: "whatsapp", to, type: "template", template: { name: cfg.waTemplate, language: { code: cfg.waLang || "es" }, components: [{ type: "body", parameters: [{ type: "text", text: text.replace(/\s*\n\s*/g, " · ").slice(0, 1000) }] }] } } : null;
    const txt = { messaging_product: "whatsapp", to, type: "text", text: { preview_url: true, body: text.slice(0, 4000) } };
    try { await j(url, { method: "POST", headers: hdr, body: JSON.stringify(tpl || txt) }); n++ }
    catch (e) { if (tpl && !/131026|131047|131051/.test(e.message)) { try { await j(url, { method: "POST", headers: hdr, body: JSON.stringify(txt) }); n++; continue } catch (e2) { console.log("wa err", to.slice(0, 4) + "…", e2.message.slice(0, 160)) } } else console.log("wa err", to.slice(0, 4) + "…", e.message.slice(0, 160)) }
  }
  return n;
}
async function mailer() { const nodemailer = (await import("nodemailer")).default; return process.env.MAIL_DRY ? nodemailer.createTransport({ jsonTransport: true }) : nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 465), secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE !== "false" : Number(process.env.SMTP_PORT || 465) === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } }) }
const smtpOk = () => !!(process.env.SMTP_HOST || process.env.MAIL_DRY);
/* очередь писем клиентам (mailq): email + WhatsApp */
async function processMailq(cfg, workers) {
  let q = []; try { q = (await list("mailq")).filter(m => !m.sent) } catch (e) { console.log("mailq", e.message.slice(0, 80)); return 0 }
  let n = 0;
  for (const m of q) {
    let sentMail = false, sentWa = 0, err = "";
    if (m.to && smtpOk()) { try { const tr = await mailer(); await tr.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to: m.to, subject: m.subject || "ANK", text: m.text || "", html: `<div style="font:14px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:#111;max-width:640px;white-space:pre-wrap">${String(m.text || "").replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c])).replace(/(https?:\/\/[^\s<>"')]+)/g, '<a href="$1">$1</a>')}</div>` }); sentMail = true } catch (e) { err = e.message.slice(0, 160); console.log("mailq mail err", err) } }
    if (m.phone && m.wa !== false) sentWa = await sendWa([m.phone], (m.subject ? m.subject + "\n\n" : "") + (m.text || ""), cfg);
    let ok = sentMail || sentWa > 0;
    if (!ok) {
      if (!m.to && !m.phone) { ok = true; err = "нет email и телефона" }
      else if (!smtpOk() && !WA_TOKEN) err = "бот: не настроены SMTP / WhatsApp (секреты GitHub)"
      else if (Date.now() - (m.ts || 0) > 7 * 86400e3) { ok = true; err = err || "не удалось отправить за 7 дней" }
      else err = err || (m.to && !smtpOk() ? "SMTP не настроен" : m.phone && !WA_TOKEN ? "WhatsApp не настроен" : "не отправлено")
    }
    try { await patch(`mailq/${m.id}`, { sent: ok, sentTs: ok ? Date.now() : (m.sentTs || 0), err: (sentMail || sentWa > 0) ? "" : err, n: (sentMail ? 1 : 0) + sentWa }) } catch (e) { console.log("mailq patch", e.message.slice(0, 80)) }
    if (ok) n++; console.log("mailq", m.id, m.kind, "mail", sentMail, "wa", sentWa);
  }
  return n;
}
/* автоматические напоминания о просроченных счетах (раз в 7 дней), если включено в настройках.
   Бот не имеет доступа к invoices — кабинет кладёт список неоплаченных счетов в bot/invdue */
async function autoInvoiceReminders(cfg, state, companyD) {
  if (!cfg.invAutoRemind) return 0; const hm = nowParts().hm; if (hm < 9 * 60 || hm >= 20 * 60) return 0; let due = null; try { due = await get("bot/invdue") } catch { return 0 }
  const inv = (due && due.on !== false && Array.isArray(due.items)) ? due.items : []; if (!inv.length) return 0;
  let objs = [], portals = []; try { [objs, portals] = await Promise.all([list("objects"), list("portal")]) } catch {}
  const today = nowParts().date, dueDays = Number(cfg.invDue) || 30, co = companyD || {}; state.invRem = state.invRem || {}; let n = 0;
  const addD = (k, d) => { const x = new Date(k + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + d); return x.toISOString().slice(0, 10) };
  const objId = place => { let h = 0; const s2 = String(place || "").trim().toLowerCase(); for (let i = 0; i < s2.length; i++) h = (h * 33 + s2.charCodeAt(i)) >>> 0; return "o" + h.toString(36) };
  for (const x of inv) {
    if (!x.id || !/^\d{4}-\d\d-\d\d$/.test(String(x.date || ""))) continue; const dueK = addD(x.date, dueDays); if (dueK >= today) continue;
    const last = Math.max(state.invRem[x.id] || 0, x.lastRem || 0); if (Date.now() - last < 7 * 86400e3) continue;
    const meta = objs.find(o => o.id === objId(x.object)) || {}, email = (x.client && x.client.email) || (meta.client && meta.client.email) || "", phone = (x.client && x.client.phone) || (meta.client && meta.client.phone) || "";
    if (!email && !phone) continue;
    const pt = portals.find(p => p.objId === objId(x.object)), fdate = k => { const [y, m2, d2] = k.split("-"); return `${d2}/${m2}/${y}` }, eur = v => (Math.round((v || 0) * 100) / 100).toLocaleString("es", { minimumFractionDigits: 2 }) + " €";
    const text = `Estimado/a ${(x.client && x.client.name) || "cliente"},\n\nle recordamos que la factura ${x.no} de fecha ${fdate(x.date)} por importe de ${eur(x.total)} (${x.object}) venció el ${fdate(dueK)} y sigue pendiente de pago.\n\n${co.iban ? "Pago por transferencia: IBAN " + co.iban + " · Concepto: " + x.no + "\n" : ""}${pt ? "Puede consultar la factura en: " + SITE + "portal.html?t=" + pt.id + "\n" : ""}\nGracias por su confianza.\n${co.name || "Ingeniería y reformas ANK S.L."}${co.phone ? " · " + co.phone : ""}`;
    const id = String(1e13 - Date.now()).padStart(13, "0") + "_auto" + n;
    try { await set(`mailq/${id}`, { id, kind: "inv", invId: x.id, invNo: x.no, object: x.object, to: email, phone: phoneNorm(phone), subject: `Recordatorio de pago · Factura ${x.no} · ${co.name || "ANK"}`, text, ts: Date.now(), by: "bot", sent: false, wa: !!cfg.waOn, auto: true }); state.invRem[x.id] = Date.now(); n++ } catch (e) { console.log("autorem", e.message.slice(0, 80)) }
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
    else if (known.ok && known.uid && /^\/(start|plan|план|status)/i.test(m.text || "")) known.wantPlan = true;
    else if (known.ok && /^\/(start|status|сегодня)/i.test(m.text || "")) known.wantStatus = true;
    else if (!known.ok) await sendTg([{ id, ok: true }], "x", "Заявка ещё не одобрена. Попросите руководителя открыть кабинет → Настройки → Уведомления.");
  }
}

/* ---------- недельный отчёт на email (HTML + PDF) ---------- */
async function weeklyMail(cfg, rows, today, to) {
  const d = new Date(today + "T12:00:00Z"); const dow = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - dow - 7); const from = d.toISOString().slice(0, 10); d.setUTCDate(d.getUTCDate() + 6); const to7 = d.toISOString().slice(0, 10);
  const norm = Number(cfg.norm || 8) * 60, holidays = new Set(String(cfg.holidays || "").split(/[,\s]+/));
  let wdays = 0; for (let i = 0; i < 7; i++) { const x = new Date(from + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + i); const k = x.toISOString().slice(0, 10); if (x.getUTCDay() >= 1 && x.getUTCDay() <= 5 && !holidays.has(k)) wdays++ }
  const per = rows.map(r => { const days = (r.l && r.l.days || []).filter(e => e.date >= from && e.date <= to7 && e.end); const h = days.reduce((a, e) => a + mins(e), 0), ot = days.reduce((a, e) => a + Math.max(0, mins(e) - norm), 0); const objs = {}; days.forEach(e => { const p = (e.place || "—").trim(); objs[p] = (objs[p] || 0) + mins(e) }); const open = (r.l && r.l.days || []).filter(e => e.date >= from && e.date <= to7 && e.start && !e.end).length; return { name: r.name, h, ot, n: days.length, open, objs, late: days.filter(e => toMin(e.start) > toMin(cfg.start) + Number(cfg.grace || 0)).length } });
  const tot = per.reduce((a, p) => ({ h: a.h + p.h, ot: a.ot + p.ot, n: a.n + p.n }), { h: 0, ot: 0, n: 0 });
  const objs = {}; per.forEach(p => Object.entries(p.objs).forEach(([k, v]) => { objs[k] = (objs[k] || 0) + v }));
  const title = `Отчёт за неделю ${from.slice(8)}.${from.slice(5, 7)} – ${to7.slice(8)}.${to7.slice(5, 7)}`;
  const tr = per.sort((a, b) => b.h - a.h).map(p => `<tr><td>${h(p.name)}</td><td align="right">${p.n}</td><td align="right">${fmt(p.h)}</td><td align="right">${p.ot ? fmt(p.ot) : ""}</td><td align="right">${p.late || ""}</td><td align="right">${p.open || ""}</td></tr>`).join("");
  const otr = Object.entries(objs).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<tr><td>${h(k)}</td><td align="right">${fmt(v)}</td></tr>`).join("");
  const html = `<div style="font:14px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:#111;max-width:720px"><h2 style="margin:0 0 4px">${title}</h2><p style="color:#555;margin:0 0 14px">Ingeniería y reformas ANK · ${rows.length} рабочих · норма ${wdays * Number(cfg.norm || 8)} ч на человека</p>
  <table cellpadding="6" style="border-collapse:collapse;width:100%;font-size:13px"><tr style="background:#f2f5fa"><td><b>Итого</b></td><td align="right"><b>${tot.n} смен</b></td><td align="right"><b>${fmt(tot.h)} ч</b></td><td align="right">${tot.ot ? "+" + fmt(tot.ot) : ""}</td><td></td><td></td></tr></table>
  <h3 style="margin:16px 0 6px">Рабочие</h3><table cellpadding="6" style="border-collapse:collapse;width:100%;font-size:13px;border:1px solid #e3e6ec"><tr style="background:#f2f5fa"><th align="left">Рабочий</th><th align="right">Смен</th><th align="right">Часы</th><th align="right">Сверх</th><th align="right">Опозд.</th><th align="right">Без «Уехал»</th></tr>${tr}</table>
  <h3 style="margin:16px 0 6px">Объекты</h3><table cellpadding="6" style="border-collapse:collapse;width:100%;font-size:13px;border:1px solid #e3e6ec"><tr style="background:#f2f5fa"><th align="left">Объект</th><th align="right">Часы</th></tr>${otr || "<tr><td colspan=2>—</td></tr>"}</table>
  <p style="color:#777;font-size:12px;margin-top:18px">Подробности, зарплата и PDF — в кабинете: <a href="${SITE}boss.html#v=report">${SITE}boss.html</a></p></div>`;
  const attachments = [];
  try { const PDFDocument = (await import("pdfkit")).default; const fs = await import("fs"); const font = ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/dejavu/DejaVuSans.ttf"].find(f => fs.existsSync(f));
    const buf = await new Promise((res, rej) => { const doc = new PDFDocument({ size: "A4", margin: 40 }); const chunks = []; doc.on("data", c => chunks.push(c)); doc.on("end", () => res(Buffer.concat(chunks))); doc.on("error", rej); if (font) doc.font(font);
      doc.fontSize(18).text(title); doc.fontSize(10).fillColor("#555").text(`Ingeniería y reformas ANK · ${rows.length} рабочих`); doc.moveDown(); doc.fillColor("#111").fontSize(11).text(`Итого: ${tot.n} смен, ${fmt(tot.h)} ч${tot.ot ? ", сверхурочных " + fmt(tot.ot) : ""}`); doc.moveDown(0.6);
      doc.fontSize(12).text("Рабочие"); doc.fontSize(10); per.forEach(p => doc.text(`${p.name}: ${p.n} смен, ${fmt(p.h)} ч${p.ot ? ", +" + fmt(p.ot) : ""}${p.late ? ", опозданий " + p.late : ""}${p.open ? ", без «Уехал» " + p.open : ""}`)); doc.moveDown(0.6);
      doc.fontSize(12).text("Объекты"); doc.fontSize(10); Object.entries(objs).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => doc.text(`${k}: ${fmt(v)} ч`)); doc.end() });
    attachments.push({ filename: `ANK_${from}_${to7}.pdf`, content: buf, contentType: "application/pdf" }) } catch (e) { console.log("pdf skipped", e.message.slice(0, 100)) }
  const tr2 = await mailer();
  const info = await tr2.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to, subject: `Табель ANK · ${title}`, html, attachments });
  if (process.env.MAIL_DRY) console.log("MAIL_DRY", to, title, "html", html.length, "pdf", attachments.length ? attachments[0].content.length : 0, String(info.message || "").length);
}

/* ---------- основной цикл ---------- */
async function main() {
  await auth();
  const [cfgD, wl, stateD, tgs, pushes, absences, remD, bcs, companyD] = await Promise.all([get("cab/cfg"), get("cab/workers"), get("bot/state"), list("tg"), list("push"), list("absences").catch(() => []), get("bot/reminders").catch(() => null), list("broadcast").catch(() => []), get("cab/company").catch(() => null)]);
  const cfg = { start: "08:00", grace: 15, norm: 8, digest: "21:00", morning: "09:30", noout: "20:00", planNotify: "18:30", mailAt: "08:00", ...(cfgD || {}) };
  const staffPush = pushes.filter(p => p.kind !== "worker"), workerPush = pushes.filter(p => p.kind === "worker" && p.uid);
  const staffTg = tgs.filter(c => !c.uid), workerTg = tgs.filter(c => c.uid);
  const holidays = new Set(String(cfg.holidays == null ? HOLIDAYS_DEFAULT : cfg.holidays).split(/[,\s]+/).filter(Boolean));
  const absent = (uid, date) => absences.some(a => a.uid === uid && a.from <= date && a.to >= date);
  const workers = (wl && wl.list) || [];
  const state = { sent: {}, ...(stateD || {}) };
  const now = nowParts(), today = now.date, weekday = now.wd >= 1 && now.wd <= 5 && !holidays.has(now.date);
  const late = toMin(cfg.start) + Number(cfg.grace || 0), noinAt = late + 30, nooutAt = toMin(cfg.noout || "20:00"), morningAt = toMin(cfg.morning || "09:30"), eveningAt = toMin(cfg.digest || "21:00");
  console.log("now", today, fmt(now.hm), "auth", authMode, "workers", workers.length, "tg", tgs.length, "push", pushes.length);
  await tgUpdates(state, tgs);

  const ledgers = await batchGet(workers.map(w => `workers/${w.id}`));
  const L = {}; for (const d of ledgers) { try { const x = JSON.parse(d.json || ""); if (x && x.app === "tabel-ank-ledger") L[d.id] = x } catch {} }
  const rows = workers.map(w => { const l = L[w.id]; const e = l && (l.days || []).find(x => x.date === today); return { w, l, e, name: w.name || (l && l.name) || "Рабочий" } });

  const alerts = []; // {key, kind, title, body}
  const once = (key, kind, title, body) => { if (state.sent[key]) return; alerts.push({ key, kind, title, body }) };
  if (weekday) for (const r of rows) {
    if (!r.l || absent(r.w.id, today)) continue;
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
  const onsite = rows.filter(r => r.e && r.e.start && !r.e.end), done = rows.filter(r => r.e && r.e.end), away = rows.filter(r => absent(r.w.id, today)), none = rows.filter(r => r.l && !(r.e && r.e.start) && !absent(r.w.id, today));
  const remItems = (remD && remD.items || []).filter(x => x.sev >= 1).slice(0, 5);
  if (weekday && now.hm >= morningAt && now.hm < morningAt + 45) once(`morning:${today}`, "morning", `Утро: на объектах ${onsite.length + done.length} из ${rows.length - away.length}`, (onsite.length ? "На объекте: " + onsite.map(r => `${first(r.name)} (${r.e.place || "?"}, с ${r.e.start})`).join(", ") + ". " : "") + (none.length ? "Не отметились: " + none.map(r => first(r.name)).join(", ") + "." : "Все отметились.") + (away.length ? " Отсутствуют: " + away.map(r => first(r.name)).join(", ") + "." : "") + (remItems.length ? "\nСроки: " + remItems.map(x => x.t).join("; ") : ""));
  if (now.hm >= eveningAt && now.hm < eveningAt + 45) { const tot = done.reduce((a, r) => a + mins(r.e), 0); once(`evening:${today}`, "evening", `Итог дня: ${fmt(tot)} ч, смен ${done.length}`, (done.map(r => `${first(r.name)} ${fmt(mins(r.e))}`).join(", ") || "Закрытых смен нет") + (onsite.length ? ". Без «Уехал»: " + onsite.map(r => first(r.name)).join(", ") : "") + (none.length && weekday ? ". Не выходили: " + none.map(r => first(r.name)).join(", ") : "")) }
  /* статус по запросу в Telegram */
  for (const c of tgs.filter(c => c.wantStatus)) await sendTg([c], "x", `<b>${today} ${fmt(now.hm)}</b>\nНа объекте: ${h(onsite.map(r => `${first(r.name)} (${r.e.place || "?"})`).join(", ") || "никого")}\nЗакончили: ${h(done.map(r => `${first(r.name)} ${fmt(mins(r.e))}`).join(", ") || "—")}\nНе отметились: ${h(none.map(r => first(r.name)).join(", ") || "—")}`);

  let sentPush = 0, sentTg = 0;
  for (const a of alerts) {
    sentPush += await sendPush(staffPush, a.kind, a.title, a.body, SITE + "boss.html" + (a.kind === "msg" ? "#v=inbox" : ""));
    sentTg += await sendTg(staffTg, a.kind, `<b>${h(a.title)}</b>\n${h(a.body)}`);
    state.sent[a.key] = Date.now();
  }
  const saveState = async () => { try { await set("bot/state", state) } catch (e) { console.log("state", e.message.slice(0, 80)) } };
  if (alerts.length) await saveState();
  /* рассылка рабочим */
  for (const b of bcs.filter(x => !x.sent)) {
    const to = b.to === "all" ? null : (Array.isArray(b.to) ? b.to : []);
    const ch = b.ch || { push: true, tg: true, wa: !!cfg.waOn };
    const subs = workerPush.filter(p => !to || to.includes(p.uid)), chats = workerTg.filter(c => !to || to.includes(c.uid)), phones = workers.filter(w => w.phone && (!to || to.includes(w.id))).map(w => w.phone);
    let n = 0, nwa = 0;
    if (ch.push !== false) n += await sendPush(subs, "bc", `${b.by || "Руководитель"}: сообщение`, b.text, SITE, "worker");
    if (ch.tg !== false) n += await sendTg(chats, "bc", `<b>${h(b.by || "Руководитель")}</b>\n${h(b.text)}`);
    if (ch.wa) nwa = await sendWa(phones, `${b.by || "ANK"}: ${b.text}`, cfg);
    try { await patch(`broadcast/${b.id}`, { sent: true, sentTs: Date.now(), n, nwa }) } catch (e) { console.log("bc patch", e.message.slice(0, 80)) }
    console.log("broadcast", b.id, "→", n, "wa", nwa);
  }
  /* план на завтра — рабочим вечером */
  const planAt = toMin(cfg.planNotify || "18:30");
  if (now.hm >= planAt && now.hm < planAt + 45 && !state.sent[`plan:${today}`]) {
    const tmr = new Date(today + "T12:00:00Z"); tmr.setUTCDate(tmr.getUTCDate() + 1); const tk = tmr.toISOString().slice(0, 10);
    let plan = null; try { plan = await get(`plans/${tk}`) } catch (e) { console.log("plan", e.message.slice(0, 80)) }
    if (plan && plan.w) for (const uid of Object.keys(plan.w)) {
      const x = plan.w[uid]; if (!x || !(x.place || (x.items && x.items.length))) continue;
      const items = (x.items || []).map(i => typeof i === "string" ? i : i.text).filter(Boolean);
      const body = `${x.place ? "📍 " + x.place : ""}${items.length ? "\n• " + items.join("\n• ") : ""}${x.note ? "\n💬 " + x.note : ""}`.trim();
      await sendPush(workerPush.filter(p => p.uid === uid), "plan", `План на завтра · ${tk.slice(8)}.${tk.slice(5, 7)}`, body.replace(/\n/g, " "), SITE, "worker");
      await sendTg(workerTg.filter(c => c.uid === uid), "plan", `<b>План на завтра · ${tk.slice(8)}.${tk.slice(5, 7)}</b>\n${h(body)}`);
    }
    state.sent[`plan:${today}`] = Date.now(); await saveState();
  }
  /* /plan по запросу рабочего в Telegram */
  for (const c of workerTg.filter(c => c.wantPlan)) {
    const tmr = new Date(today + "T12:00:00Z"); tmr.setUTCDate(tmr.getUTCDate() + 1); const tk = tmr.toISOString().slice(0, 10);
    let p1 = null, p2 = null; try { [p1, p2] = await Promise.all([get(`plans/${today}`), get(`plans/${tk}`)]) } catch (e) { console.log("plan req", e.message.slice(0, 80)) }
    const fmtP = (p, label) => { const x = p && p.w && p.w[c.uid]; if (!x || !(x.place || (x.items && x.items.length))) return `${label}: плана нет`; return `<b>${label}</b>: ${h(x.place || "")}${(x.items || []).length ? "\n• " + h(x.items.map(i => (i.done ? "✓ " : "") + (i.text || i)).join("\n• ")) : ""}${x.note ? "\n💬 " + h(x.note) : ""}` };
    await sendTg([c], "x", `${fmtP(p1, "Сегодня")}\n${fmtP(p2, "Завтра")}`);
  }
  /* недельный отчёт на email по понедельникам */
  if (now.wd === 1 && now.hm >= toMin(cfg.mailAt || "08:00") && now.hm < toMin(cfg.mailAt || "08:00") + 45 && !state.sent[`mail:${today}`] && process.env.SMTP_HOST && (cfg.mailTo || process.env.MAIL_TO)) {
    try { await weeklyMail(cfg, rows, today, cfg.mailTo || process.env.MAIL_TO); state.sent[`mail:${today}`] = Date.now(); console.log("weekly mail sent") } catch (e) { console.log("mail err", e.message.slice(0, 200)) }
  }
  /* письма и WhatsApp клиентам: очередь из кабинета + автонапоминания о просроченных счетах */
  let autoN = 0, mailN = 0; try { autoN = await autoInvoiceReminders(cfg, state, companyD) } catch (e) { console.log("autorem", e.message.slice(0, 80)) } try { mailN = await processMailq(cfg, workers) } catch (e) { console.log("mailq", e.message.slice(0, 80)) }
  if (autoN || mailN) console.log("client reminders: auto", autoN, "sent", mailN);
  const cut = Date.now() - 3 * 86400e3; for (const k of Object.keys(state.sent)) if (state.sent[k] < cut) delete state.sent[k];
  state.lastRun = Date.now(); state.lastRunText = `${today} ${fmt(now.hm)}`;
  await saveState();
  console.log(`auth ${authMode} | alerts ${alerts.length}: ${alerts.map(a => a.key).join(", ") || "—"} | push ${sentPush} | telegram ${sentTg}`);
}
main().catch(e => { console.error(e); process.exit(1) });
