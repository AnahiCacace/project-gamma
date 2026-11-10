#!/usr/bin/env node
// scripts/what-now.mjs — motor de la skill /what-now (ver SKILLS.md).
//
// Lee docs/checklist.md y la task bloqueante de CONTEXT.md, calcula el estado y los tiempos
// de cada task, actualiza el dashboard (docs/dashboard/) y muestra el reporte en Markdown.
// No modifica el checklist: eso lo hace el agente, con evidencia, antes de ejecutar este script.
//
// Uso:
//   node scripts/what-now.mjs            reporte completo + actualiza el dashboard
//   node scripts/what-now.mjs P2         solo ese nivel de prioridad
//   node scripts/what-now.mjs T-018      detalle de una task
//   node scripts/what-now.mjs mvp        solo P0–P3
//   node scripts/what-now.mjs -dash      actualiza el dashboard e imprime su ruta y resumen
//   node scripts/what-now.mjs -kanban    actualiza el dashboard e imprime el tablero kanban
//   --no-write                           no escribe archivos (solo muestra)
//
// Sin dependencias: Node.js 18+.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHECKLIST = join(ROOT, 'docs/checklist.md');
const CONTEXT = join(ROOT, 'CONTEXT.md');
const DASH_DIR = join(ROOT, 'docs/dashboard');
const DASH_HTML = join(DASH_DIR, 'index.html');
const HISTORY = join(DASH_DIR, 'history.json');
const HOURS_PER_DAY = 8;

const args = process.argv.slice(2);
const noWrite = args.includes('--no-write');
const dashMode = args.includes('-dash') || args.includes('--dash');
const kanbanMode = args.includes('-kanban') || args.includes('--kanban');
const filter = args.find(a => !a.startsWith('-')) || null;

// ---------------------------------------------------------------- parseo
if (!existsSync(CHECKLIST)) {
  console.error('No existe docs/checklist.md. Créalo a partir del backlog de CONTEXT.md (ver SKILLS.md → /what-now).');
  process.exit(1);
}
const checklistText = readFileSync(CHECKLIST, 'utf8');
const contextText = existsSync(CONTEXT) ? readFileSync(CONTEXT, 'utf8') : '';

const UNIT = { min: 1 / 60, h: 1, 'día': HOURS_PER_DAY, 'días': HOURS_PER_DAY, semana: 5 * HOURS_PER_DAY, semanas: 5 * HOURS_PER_DAY };

function parseEstimate(raw) {
  const text = (raw || '').replace(/^⏱\s*/, '').trim();
  if (!text || /por estimar/i.test(text)) return { text: text || 'por estimar', hours: null, calendar: false, undefined: true };
  const calendar = text.startsWith('📅');
  const m = text.match(/(\d+(?:[.,]\d+)?)(?:\s*[–-]\s*(\d+(?:[.,]\d+)?))?\s*(min|h|días|día|semanas|semana)\b/);
  let hours = null;
  if (m && !calendar) {
    const a = parseFloat(m[1].replace(',', '.'));
    const b = m[2] ? parseFloat(m[2].replace(',', '.')) : a;
    hours = ((a + b) / 2) * UNIT[m[3]];
  }
  return { text, hours, calendar, undefined: false };
}

const tasks = [];
const done = [];
let section = null;
let updated = (checklistText.match(/\*\*Última actualización:\*\*\s*(.+)/) || [])[1] || '';

for (const line of checklistText.split('\n')) {
  const h = line.match(/^## (P\d) — (.+)$/);
  if (h) { section = { prio: h[1], label: h[2].trim() }; continue; }
  if (/^## .*Completado/.test(line)) { section = { prio: 'done' }; continue; }
  if (/^## /.test(line)) { section = null; continue; }
  const item = line.match(/^- \[( |x)\] (?:\*\*(T-\d+)\*\* — )?(.+)$/);
  if (!item || !section) continue;
  const [, mark, id, rest] = item;
  if (mark === 'x' || section.prio === 'done') {
    const date = (rest.match(/\((\d{4}-\d{2}-\d{2})/) || [])[1] || null;
    done.push({ id: id || null, title: rest.replace(/\s*\(\d{4}-\d{2}-\d{2}.*\)\s*$/, '').trim(), date });
    continue;
  }
  const parts = rest.split(' · ').map(s => s.trim());
  const est = parseEstimate(parts.find(p => p.startsWith('⏱')) || '');
  const others = parts.filter(p => !p.startsWith('⏱'));
  const title = others[0] || '';
  const owner = others[1] || '—';
  const depsText = others.slice(2).join(' · ') || '—';
  const deps = [...depsText.matchAll(/T-\d+/g)].map(m => m[0]);
  tasks.push({ id, prio: section.prio, prioLabel: section.label, title, owner, depsText, deps, est });
}

const blockingId = (() => {
  const sec = contextText.split(/^## /m).find(s => /Task bloqueante/.test(s.split('\n')[0]));
  if (!sec || /\*\*Ninguna\.?\*\*/.test(sec)) return null;
  return (sec.match(/\*\*ID:\*\*\s*(T-\d+)/) || [])[1] || null;
})();

// ---------------------------------------------------------------- estados
const doneIds = new Set(done.map(d => d.id).filter(Boolean));
for (const t of tasks) {
  const unmet = t.deps.filter(d => !doneIds.has(d));
  t.unmet = unmet;
  if (t.id === blockingId) t.status = 'En curso';
  else if (unmet.length) t.status = 'Esperando ' + unmet.join(', ');
  else if (/^usuario/i.test(t.owner)) t.status = 'Usuario';
  else if (t.est.undefined || t.owner === '—') t.status = 'Sin definir';
  else t.status = 'Lista';
  t.statusKey = t.status.startsWith('Esperando') ? 'Esperando' : t.status;
}

const PRIOS = [...new Set(tasks.map(t => t.prio))].sort();
const sumH = list => list.reduce((a, t) => a + (t.est.hours || 0), 0);
const inPrios = ps => tasks.filter(t => ps.includes(t.prio));
const fmtH = h => {
  if (!h) return '0 h';
  const r = Math.round(h * 2) / 2;
  const s = String(r).replace('.', ',');
  return r >= HOURS_PER_DAY ? `~${s} h (~${String(Math.round(r / HOURS_PER_DAY * 2) / 2).replace('.', ',')} días de trabajo)` : `~${s} h`;
};

const blocking = tasks.find(t => t.id === blockingId) || null;
const firstOf = st => tasks.find(t => t.status === st);
let recommended = blocking, parallel = null, reason = '';
if (blocking) reason = 'Es la task bloqueante: no se empieza otra hasta cerrarla.';
else {
  recommended = tasks.find(t => t.status === 'Lista' || t.status === 'Usuario') || null;
  if (recommended?.status === 'Usuario') {
    parallel = firstOf('Lista');
    reason = 'Es la de mayor prioridad y depende de vos.';
  } else if (recommended) reason = 'Es la primera task lista del nivel de prioridad más alto.';
}

const milestones = [
  { label: 'MVP funcional de punta a punta (P0–P2)', list: inPrios(['P0', 'P1', 'P2']) },
  { label: 'MVP completo (P0–P3)', list: inPrios(['P0', 'P1', 'P2', 'P3']) },
].map(m => ({ label: m.label, count: m.list.length, hours: sumH(m.list) }));
const p4 = inPrios(['P4']);
const calendarRange = p4.filter(t => t.est.calendar).map(t => t.est.text.replace('📅', '').trim());

const today = new Date().toISOString().slice(0, 10);
const statusCounts = ['En curso', 'Lista', 'Esperando', 'Usuario', 'Sin definir']
  .map(k => ({ status: k, count: tasks.filter(t => t.statusKey === k).length }));

// ---------------------------------------------------------------- kanban
// Columnas en orden de flujo. Cada ticket cae en una sola columna según su estado.
const KANBAN = [
  { key: 'Sin definir', title: 'Por definir', help: 'Sin alcance ni estimado' },
  { key: 'Esperando', title: 'Esperando dependencia', help: 'Le falta otra task' },
  { key: 'Usuario', title: 'Esperando al usuario', help: 'Necesita una decisión o acción tuya' },
  { key: 'Lista', title: 'Lista para empezar', help: 'La puede tomar un agente (con tu confirmación)' },
  { key: 'En curso', title: 'En curso', help: 'Task bloqueante actual' },
  { key: 'done', title: 'Completada', help: 'Cerrada con evidencia' },
];

// ---------------------------------------------------------------- historial
let history = [];
if (existsSync(HISTORY)) { try { history = JSON.parse(readFileSync(HISTORY, 'utf8')); } catch { history = []; } }
const snapshot = {
  date: today, done: done.length, pending: tasks.length,
  hoursMvp: Math.round(milestones[0].hours * 10) / 10,
  hoursMvpFull: Math.round(milestones[1].hours * 10) / 10,
  waitingUser: tasks.filter(t => t.statusKey === 'Usuario').length,
};
history = history.filter(h => h.date !== today).concat(snapshot).sort((a, b) => a.date.localeCompare(b.date));

// ---------------------------------------------------------------- dashboard
const data = {
  generated: today, checklistUpdated: updated.trim(), blocking: blocking && pick(blocking),
  recommended: recommended && pick(recommended), parallel: parallel && pick(parallel), reason,
  totals: { done: done.length, pending: tasks.length },
  milestones, calendarRange, statusCounts,
  byPrio: PRIOS.map(p => ({ prio: p, label: tasks.find(t => t.prio === p).prioLabel, count: inPrios([p]).length, hours: sumH(inPrios([p])), calendar: inPrios([p]).some(t => t.est.calendar) })),
  tasks: tasks.map(pick), done, history, kanban: KANBAN,
};
function pick(t) { return { id: t.id, prio: t.prio, title: t.title, owner: t.owner, deps: t.depsText, status: t.status, statusKey: t.statusKey, est: t.est.text, hours: t.est.hours }; }

if (!noWrite) {
  mkdirSync(DASH_DIR, { recursive: true });
  writeFileSync(HISTORY, JSON.stringify(history, null, 2) + '\n');
  writeFileSync(DASH_HTML, renderHTML(data));
}

// ---------------------------------------------------------------- reporte
const rows = list => [
  '| Estado | ID | Task | ⏱ Estimado | Responsable | Depende de |',
  '|---|---|---|---|---|---|',
  ...list.map(t => `| ${t.status} | ${t.id} | ${t.title} | ${t.est.text} | ${t.owner} | ${t.depsText} |`),
].join('\n');

const out = [];
if (filter && /^T-\d+$/i.test(filter)) {
  const t = tasks.find(x => x.id === filter.toUpperCase());
  const d = done.find(x => x.id === filter.toUpperCase());
  if (t) out.push(`## ${t.id} — ${t.title}`, '', `- Prioridad: ${t.prio} (${t.prioLabel})`, `- Estado: ${t.status}`, `- Estimado: ${t.est.text}`, `- Responsable: ${t.owner}`, `- Depende de: ${t.depsText}`, t.unmet.length ? `- Bloqueada por: ${t.unmet.join(', ')}` : '- Sin dependencias pendientes', `- La necesitan: ${tasks.filter(x => x.deps.includes(t.id)).map(x => x.id).join(', ') || 'ninguna'}`);
  else if (d) out.push(`## ${d.id} — completada (${d.date || 'sin fecha'})`, '', d.title);
  else out.push(`No encontré ${filter} en docs/checklist.md.`);
} else if (kanbanMode) {
  out.push(`## Kanban de tickets — ${today}`, '');
  for (const c of KANBAN) {
    const list = c.key === 'done' ? done : tasks.filter(t => t.statusKey === c.key);
    const h = c.key === 'done' ? '' : ` · ${fmtH(sumH(list))}`;
    out.push(`### ${c.title} (${list.length}${h})`);
    if (!list.length) out.push('- (vacía)');
    else if (c.key === 'done') list.forEach(d => out.push(`- ${d.id ? d.id + ' — ' : ''}${d.title}${d.date ? ' (' + d.date + ')' : ''}`));
    else list.forEach(t => out.push(`- ${t.id} [${t.prio}] ${t.title} — ${t.est.text} — ${t.owner}${t.statusKey === 'Esperando' ? ' — ' + t.status : ''}`));
    out.push('');
  }
  out.push(noWrite ? 'Dashboard: no se actualizó (--no-write).' : 'Dashboard actualizado: docs/dashboard/index.html#kanban');
} else if (dashMode) {
  out.push(`## Dashboard actualizado — ${today}`, '', `Archivo: docs/dashboard/index.html`, `Avance: ${done.length} de ${done.length + tasks.length} tasks completadas (${Math.round(done.length / (done.length + tasks.length) * 100)} %)`, `Siguiente acción recomendada: ${recommended ? `${recommended.id} — ${recommended.title} — ${recommended.est.text}` : 'ninguna'}`, ...milestones.map(m => `${m.label}: ${m.count} tasks, ${fmtH(m.hours)}`));
} else {
  const prios = filter && /^P\d$/i.test(filter) ? [filter.toUpperCase()] : filter === 'mvp' ? ['P0', 'P1', 'P2', 'P3'] : PRIOS;
  out.push(`## ¿Qué sigue? — ${today}`, '',
    `Task bloqueante: ${blocking ? `${blocking.id} — ${blocking.title}` : 'Ninguna'}`,
    `Siguiente acción recomendada: ${recommended ? `${recommended.id} — ${recommended.title} — ${recommended.est.text} — ${reason}` : 'ninguna'}`,
    parallel ? `En paralelo, un agente puede avanzar: ${parallel.id} — ${parallel.title} — ${parallel.est.text}` : '', '');
  for (const p of prios) {
    const list = inPrios([p]); if (!list.length) continue;
    const cal = list.some(t => t.est.calendar) ? ' (más tiempos de calendario)' : '';
    out.push(`### ${p} — ${list[0].prioLabel} · ⏱ total ${fmtH(sumH(list))}${cal}`, rows(list), '');
  }
  out.push('### Resumen de tiempos', '| Hito | Tasks pendientes | ⏱ Esfuerzo estimado |', '|---|---|---|',
    ...milestones.map(m => `| ${m.label} | ${m.count} | ${fmtH(m.hours)} |`),
    `| Negocio y legal (P4, en paralelo) | ${p4.length} | calendario: ${calendarRange.join(' · ') || '—'} |`,
    `| Total pendiente | ${tasks.length} | ${done.length} completadas |`, '',
    noWrite ? 'Dashboard: no se actualizó (--no-write).' : 'Dashboard actualizado: docs/dashboard/index.html');
}
console.log(out.filter(l => l !== null).join('\n').replace(/\n{3,}/g, '\n\n'));

// ---------------------------------------------------------------- HTML
function renderHTML(d) {
  const json = JSON.stringify(d).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Project Gamma — Seguimiento</title>
<!-- GENERADO por scripts/what-now.mjs (skill /what-now). No editar a mano: se sobrescribe. -->
<style>
  :root { --bg:#f4f4f2; --surface:#fcfcfb; --text:#0b0b0b; --text-2:#52514e; --muted:#7b7a74; --line:#e2e1dc; --series:#2a78d6; --track:#ecebe6; --accent-bg:#eef4fc;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color-scheme: light; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg:#111110; --surface:#1a1a19; --text:#f0efec; --text-2:#c3c2b7; --muted:#8f8e86; --line:#2e2e2b; --series:#3987e5; --track:#262624; --accent-bg:#17243a; color-scheme: dark; } }
  :root[data-theme="dark"] { --bg:#111110; --surface:#1a1a19; --text:#f0efec; --text-2:#c3c2b7; --muted:#8f8e86; --line:#2e2e2b; --series:#3987e5; --track:#262624; --accent-bg:#17243a; color-scheme: dark; }
  * { box-sizing: border-box; margin: 0; }
  body { background: var(--bg); color: var(--text); padding: 24px 16px 48px; line-height: 1.45; }
  main { max-width: 1100px; margin: 0 auto; display: grid; gap: 16px; }
  header { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 8px; }
  h1 { font-size: 24px; letter-spacing: -.01em; }
  h2 { font-size: 15px; margin-bottom: 12px; }
  .sub { color: var(--text-2); font-size: 13px; }
  .card { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 16px; min-width: 0; }
  .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
  .kpi .label { color: var(--text-2); font-size: 13px; }
  .kpi .value { font-size: 28px; font-weight: 700; margin: 4px 0 2px; font-variant-numeric: tabular-nums; }
  .kpi .note { color: var(--muted); font-size: 12px; }
  .bar { height: 8px; background: var(--track); border-radius: 4px; overflow: hidden; margin-top: 8px; }
  .bar > i { display: block; height: 100%; background: var(--series); border-radius: 4px; }
  .next { background: var(--accent-bg); }
  .next p { margin-top: 4px; font-size: 14px; }
  .two { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 760px) { .two { grid-template-columns: 1fr; } }
  svg text { fill: var(--text-2); font-size: 12px; }
  .filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
  select, input { font: inherit; font-size: 13px; color: var(--text); background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 6px 8px; }
  input { flex: 1; min-width: 160px; }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--line); vertical-align: top; }
  th { color: var(--text-2); font-weight: 600; white-space: nowrap; }
  td.num { font-variant-numeric: tabular-nums; white-space: nowrap; }
  .status { display: inline-block; border: 1px solid var(--line); border-radius: 999px; padding: 1px 8px; white-space: nowrap; font-size: 12px; }
  .status.Lista { border-color: var(--series); color: var(--series); font-weight: 600; }
  .status.Usuario { font-weight: 600; }
  .tip { position: fixed; pointer-events: none; background: var(--text); color: var(--bg); font-size: 12px; padding: 6px 8px; border-radius: 6px; opacity: 0; transition: opacity .1s; z-index: 9; }
  ul.done { padding-left: 18px; font-size: 13px; color: var(--text-2); columns: 2 280px; }
  .empty { color: var(--muted); font-size: 13px; }
  code { font-size: .92em; background: var(--track); border-radius: 4px; padding: 0 4px; }
  .kanban { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(230px, 1fr); gap: 12px; overflow-x: auto; padding-bottom: 6px; scroll-snap-type: x mandatory; }
  .col { background: var(--bg); border: 1px solid var(--line); border-radius: 10px; padding: 10px; scroll-snap-align: start; display: flex; flex-direction: column; gap: 8px; min-height: 120px; max-height: 720px; overflow-y: auto; }
  .col-head { position: sticky; top: -10px; background: var(--bg); padding: 4px 0; z-index: 1; }
  .col-head { display: flex; justify-content: space-between; align-items: baseline; gap: 6px; }
  .col-head b { font-size: 13px; }
  .col-head span { color: var(--muted); font-size: 12px; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .col-help { color: var(--muted); font-size: 12px; margin-top: -4px; }
  .ticket { background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; font-size: 13px; }
  .ticket.next-up { border-color: var(--series); box-shadow: inset 3px 0 0 var(--series); }
  .ticket .tid { font-weight: 700; font-variant-numeric: tabular-nums; }
  .ticket .meta { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
  .ticket .meta span { border: 1px solid var(--line); border-radius: 10px; padding: 0 6px; font-size: 11px; color: var(--text-2); max-width: 100%; overflow-wrap: anywhere; }
  .ticket .wait { color: var(--text-2); font-size: 12px; margin-top: 4px; }
  .more { font: inherit; font-size: 12px; background: none; border: 0; color: var(--series); cursor: pointer; text-align: left; padding: 2px 0; }
  footer { color: var(--muted); font-size: 12px; text-align: center; }
  button.theme { font: inherit; font-size: 12px; background: none; border: 1px solid var(--line); border-radius: 8px; padding: 4px 10px; color: var(--text-2); cursor: pointer; }
</style>
</head>
<body>
<main>
  <header>
    <div><h1>Project Gamma — Seguimiento</h1>
      <div class="sub" id="meta"></div></div>
    <button class="theme" id="theme">Cambiar tema</button>
  </header>
  <section class="kpis" id="kpis"></section>
  <section class="card next" id="next"></section>
  <section class="card" id="kanban">
    <h2>Kanban de tickets</h2>
    <div class="filters">
      <select id="kPrio" aria-label="Prioridad del kanban"></select>
      <select id="kOwner" aria-label="Responsable del kanban"></select>
    </div>
    <div class="kanban" id="board"></div>
    <p class="sub" style="margin-top:8px">Solo lectura: refleja docs/checklist.md. Para mover un ticket, actualiza el checklist (o pídeselo a un agente) y ejecuta /what-now.</p>
  </section>
  <section class="two">
    <div class="card"><h2>Horas pendientes por prioridad</h2><div id="byPrio"></div></div>
    <div class="card"><h2>Horas pendientes para el MVP completo, por fecha</h2><div id="history"></div></div>
  </section>
  <section class="card"><h2>Tasks por estado</h2><div class="table-wrap"><table id="statusTable"></table></div></section>
  <section class="card">
    <h2>Pendientes, de mayor a menor prioridad</h2>
    <div class="filters">
      <select id="fPrio" aria-label="Prioridad"></select>
      <select id="fStatus" aria-label="Estado"></select>
      <select id="fOwner" aria-label="Responsable"></select>
      <input id="fText" placeholder="Buscar task o ID" aria-label="Buscar">
    </div>
    <div class="table-wrap"><table id="tasks"></table></div>
  </section>
  <section class="card"><h2>Completadas</h2><ul class="done" id="done"></ul></section>
  <footer>Generado por la skill /what-now (scripts/what-now.mjs) a partir de docs/checklist.md. Se actualiza en cada ejecución; no editar a mano.</footer>
</main>
<div class="tip" id="tip"></div>
<script id="data" type="application/json">${json}</script>
<script>
const D = JSON.parse(document.getElementById('data').textContent);
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const md = s => esc(s).replace(/\\x60([^\\x60]+)\\x60/g, '<code>$1</code>');
const fmt = h => h == null ? '—' : (Math.round(h * 2) / 2).toLocaleString('es') + ' h';
const days = h => (Math.round(h / 8 * 2) / 2).toLocaleString('es') + ' días de trabajo';
const tip = $('tip');
function showTip(e, html) { tip.innerHTML = html; tip.style.opacity = 1; tip.style.left = Math.min(e.clientX + 12, innerWidth - 220) + 'px'; tip.style.top = (e.clientY + 12) + 'px'; }
function hideTip() { tip.style.opacity = 0; }

$('theme').onclick = () => { const r = document.documentElement; const dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; r.dataset.theme = dark ? 'light' : 'dark'; };
$('meta').textContent = 'Actualizado: ' + D.generated + ' · Checklist: ' + (D.checklistUpdated || '—');

const total = D.totals.done + D.totals.pending;
const pct = total ? Math.round(D.totals.done / total * 100) : 0;
const waiting = D.statusCounts.find(s => s.status === 'Usuario').count;
$('kpis').innerHTML = [
  ['Avance del checklist', pct + ' %', D.totals.done + ' de ' + total + ' tasks completadas', pct],
  ['Para el MVP funcional (P0–P2)', fmt(D.milestones[0].hours), D.milestones[0].count + ' tasks · ~' + days(D.milestones[0].hours)],
  ['Para el MVP completo (P0–P3)', fmt(D.milestones[1].hours), D.milestones[1].count + ' tasks · ~' + days(D.milestones[1].hours)],
  ['Esperan una acción tuya', waiting, 'Tasks con estado Usuario'],
].map(([l, v, n, bar]) => '<div class="card kpi"><div class="label">' + l + '</div><div class="value">' + v + '</div><div class="note">' + n + '</div>' + (bar != null ? '<div class="bar" role="img" aria-label="' + bar + ' % completado"><i style="width:' + bar + '%"></i></div>' : '') + '</div>').join('');

const t = (x, prefix) => x ? prefix + '<b>' + esc(x.id) + '</b> — ' + md(x.title) + ' (' + esc(x.est) + ', ' + esc(x.owner) + ')' : '';
$('next').innerHTML = '<h2>Qué sigue</h2>' +
  '<p>Task bloqueante: ' + (D.blocking ? '<b>' + esc(D.blocking.id) + '</b> — ' + md(D.blocking.title) : 'Ninguna') + '</p>' +
  '<p>' + (D.recommended ? t(D.recommended, 'Siguiente acción recomendada: ') + '. ' + esc(D.reason) : 'No hay acciones pendientes.') + '</p>' +
  (D.parallel ? '<p>' + t(D.parallel, 'En paralelo, un agente puede avanzar: ') + '</p>' : '') +
  (D.calendarRange.length ? '<p class="sub">Negocio y legal (P4) corre en paralelo con tiempos de calendario: ' + esc(D.calendarRange.join(' · ')) + '.</p>' : '');

// Barras horizontales: una sola serie (horas), etiqueta directa al final de cada barra.
(function bars() {
  const rows = D.byPrio, max = Math.max(1, ...rows.map(r => r.hours));
  const W = 460, rowH = 34, left = 150, right = 70, H = rows.length * rowH + 8;
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="Horas pendientes por prioridad">';
  rows.forEach((r, i) => {
    const y = i * rowH + 6, w = r.hours ? Math.max(4, (W - left - right) * r.hours / max) : 0;
    const label = r.prio + ' · ' + r.count + ' tasks';
    s += '<text x="0" y="' + (y + 15) + '">' + esc(label) + '</text>';
    s += '<rect x="' + left + '" y="' + (y + 4) + '" width="' + (W - left - right) + '" height="16" fill="transparent" data-tip="' + esc('<b>' + r.prio + ' — ' + r.label + '</b><br>' + r.count + ' tasks · ' + fmt(r.hours) + (r.calendar ? '<br>Más tiempos de calendario' : '')) + '"/>';
    if (w) s += '<rect x="' + left + '" y="' + (y + 6) + '" width="' + w + '" height="12" rx="4" fill="var(--series)" pointer-events="none"/>';
    s += '<text x="' + (left + w + 6) + '" y="' + (y + 16) + '">' + (r.hours ? fmt(r.hours) : (r.calendar ? 'calendario' : '—')) + '</text>';
  });
  $('byPrio').innerHTML = s + '</svg><p class="sub" style="margin-top:6px">Horas de trabajo efectivo. P4 depende sobre todo de terceros (tiempo de calendario).</p>';
})();

// Línea: horas pendientes del MVP completo en cada ejecución (una por día).
(function line() {
  const h = D.history;
  if (h.length < 2) { $('history').innerHTML = '<p class="empty">Hay ' + h.length + ' registro (' + esc(h[0]?.date || '') + ': ' + fmt(h[0]?.hoursMvpFull) + '). La línea aparece desde la segunda fecha: cada ejecución de /what-now guarda un punto por día.</p>'; return; }
  const W = 460, H = 200, l = 44, r = 12, tp = 12, b = 28, max = Math.max(...h.map(x => x.hoursMvpFull)) * 1.1 || 1;
  const x = i => l + (W - l - r) * i / (h.length - 1), y = v => tp + (H - tp - b) * (1 - v / max);
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="Evolución de horas pendientes">';
  [0, .5, 1].forEach(f => { const v = max * f; s += '<line x1="' + l + '" x2="' + (W - r) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="var(--line)"/><text x="' + (l - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + Math.round(v) + '</text>'; });
  s += '<path d="' + h.map((p, i) => (i ? 'L' : 'M') + x(i) + ' ' + y(p.hoursMvpFull)).join(' ') + '" fill="none" stroke="var(--series)" stroke-width="2"/>';
  h.forEach((p, i) => {
    s += '<circle cx="' + x(i) + '" cy="' + y(p.hoursMvpFull) + '" r="4" fill="var(--series)" stroke="var(--surface)" stroke-width="2"/>';
    s += '<rect x="' + (x(i) - 14) + '" y="' + tp + '" width="28" height="' + (H - tp - b) + '" fill="transparent" data-tip="' + esc('<b>' + p.date + '</b><br>MVP completo: ' + fmt(p.hoursMvpFull) + '<br>MVP funcional: ' + fmt(p.hoursMvp) + '<br>Completadas: ' + p.done + ' · Pendientes: ' + p.pending) + '"/>';
  });
  s += '<text x="' + l + '" y="' + (H - 6) + '">' + esc(h[0].date) + '</text><text x="' + (W - r) + '" y="' + (H - 6) + '" text-anchor="end">' + esc(h[h.length - 1].date) + '</text>';
  $('history').innerHTML = s + '</svg>';
})();

document.addEventListener('mousemove', e => { const el = e.target.closest('[data-tip]'); el ? showTip(e, el.getAttribute('data-tip')) : hideTip(); });

const STATUS_HELP = { 'En curso': 'Task bloqueante actual', 'Lista': 'Dependencias completas; la puede empezar un agente', 'Esperando': 'Le falta al menos otra task', 'Usuario': 'Necesita una decisión o acción tuya', 'Sin definir': 'Sin alcance ni estimado todavía' };
$('statusTable').innerHTML = '<tr><th>Estado</th><th>Tasks</th><th>Qué significa</th></tr>' + D.statusCounts.map(s => '<tr><td><span class="status ' + s.status.replace(' ', '') + '">' + s.status + '</span></td><td class="num">' + s.count + '</td><td>' + STATUS_HELP[s.status] + '</td></tr>').join('');

const opts = (el, label, vals) => { el.innerHTML = '<option value="">' + label + ': todas</option>' + vals.map(v => '<option>' + esc(v) + '</option>').join(''); };
opts($('fPrio'), 'Prioridad', [...new Set(D.tasks.map(x => x.prio))]);
opts($('fStatus'), 'Estado', ['En curso', 'Lista', 'Esperando', 'Usuario', 'Sin definir'].filter(s => D.tasks.some(x => x.statusKey === s)));
opts($('fOwner'), 'Responsable', ['Usuario', 'Claude Code']);
function renderTasks() {
  const p = $('fPrio').value, st = $('fStatus').value, o = $('fOwner').value, q = $('fText').value.trim().toLowerCase();
  const rows = D.tasks.filter(x => (!p || x.prio === p) && (!st || x.statusKey === st) && (!o || x.owner.toLowerCase().includes(o.toLowerCase())) && (!q || (x.id + ' ' + x.title).toLowerCase().includes(q)));
  $('tasks').innerHTML = '<tr><th>Prioridad</th><th>ID</th><th>Task</th><th>Estado</th><th>Estimado</th><th>Responsable</th><th>Depende de</th></tr>' +
    (rows.map(x => '<tr><td>' + x.prio + '</td><td class="num">' + esc(x.id) + '</td><td>' + md(x.title) + '</td><td><span class="status ' + x.statusKey.replace(' ', '') + '">' + esc(x.status) + '</span></td><td class="num">' + esc(x.est) + '</td><td>' + esc(x.owner) + '</td><td>' + md(x.deps) + '</td></tr>').join('') || '<tr><td colspan="7" class="empty">No hay tasks con esos filtros.</td></tr>');
}
['fPrio', 'fStatus', 'fOwner', 'fText'].forEach(id => $(id).addEventListener('input', renderTasks));
renderTasks();
opts($('kPrio'), 'Prioridad', [...new Set(D.tasks.map(x => x.prio))]);
opts($('kOwner'), 'Responsable', ['Usuario', 'Claude Code']);
let showAllDone = false;
function renderBoard() {
  const p = $('kPrio').value, o = $('kOwner').value;
  const keep = x => (!p || x.prio === p) && (!o || x.owner.toLowerCase().includes(o.toLowerCase()));
  const nextId = D.recommended && D.recommended.id;
  $('board').innerHTML = D.kanban.map(c => {
    let cards, head;
    if (c.key === 'done') {
      const all = D.done.slice().reverse(), list = showAllDone ? all : all.slice(0, 6);
      head = all.length + ' tickets';
      cards = list.map(x => '<div class="ticket"><span class="tid">' + esc(x.id || '—') + '</span> ' + md(x.title) + (x.date ? '<div class="meta"><span>' + x.date + '</span></div>' : '') + '</div>').join('') +
        (all.length > 6 ? '<button class="more" id="moreDone">' + (showAllDone ? 'Ver menos' : 'Ver las ' + all.length) + '</button>' : '');
    } else {
      const list = D.tasks.filter(x => x.statusKey === c.key && keep(x));
      const hrs = list.reduce((a, x) => a + (x.hours || 0), 0);
      head = list.length + ' · ' + fmt(hrs);
      cards = list.map(x => '<div class="ticket' + (x.id === nextId ? ' next-up' : '') + '" title="' + (x.id === nextId ? 'Siguiente acción recomendada' : '') + '">' +
        '<span class="tid">' + esc(x.id) + '</span> ' + md(x.title) +
        (x.statusKey === 'Esperando' ? '<div class="wait">' + esc(x.status) + '</div>' : '') +
        '<div class="meta"><span>' + x.prio + '</span><span>' + esc(x.est) + '</span><span>' + esc(x.owner) + '</span>' + (x.id === nextId ? '<span>Siguiente</span>' : '') + '</div></div>').join('');
    }
    return '<div class="col" aria-label="' + esc(c.title) + '"><div class="col-head"><b>' + esc(c.title) + '</b><span>' + head + '</span></div><div class="col-help">' + esc(c.help) + '</div>' + (cards || '<div class="empty">Vacía</div>') + '</div>';
  }).join('');
  const m = $('moreDone'); if (m) m.onclick = () => { showAllDone = !showAllDone; renderBoard(); };
}
['kPrio', 'kOwner'].forEach(id => $(id).addEventListener('input', renderBoard));
renderBoard();
$('done').innerHTML = D.done.map(x => '<li>' + (x.id ? '<b>' + esc(x.id) + '</b> — ' : '') + md(x.title) + (x.date ? ' (' + x.date + ')' : '') + '</li>').join('') || '<li class="empty">Todavía nada.</li>';
</script>
</body>
</html>
`;
}
