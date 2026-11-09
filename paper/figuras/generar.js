#!/usr/bin/env node
// Genera las figuras del paper (SVG) en esta carpeta y escribe las cifras que cita el texto.
// Uso: node paper/figuras/generar.js
// Contiene solo las funciones del modelo que hacen falta. Licencia MIT (ver LICENSE).
// Las energías del modelo de fichas están en una unidad arbitraria común; las de la ficha real, en joules.
"use strict";
const fs = require("node:fs");
const path = require("node:path");

const COLORES = ["#2a55c9", "#c25a00", "#1f7a4d", "#b3261e", "#7a3fb8", "#555555"];
const FUENTE = 'font-family="DejaVu Sans, Helvetica, Arial, sans-serif"';

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Números con coma decimal y signo menos tipográfico.
function num(x) {
  if (x === 0) return "0";
  const a = Math.abs(x);
  let s;
  if (a >= 1e4 || a < 1e-3) {
    const e = Math.floor(Math.log10(a));
    const m = x / 10 ** e;
    s = (Math.abs(m - 1) < 1e-9 ? "" : `${Number(m.toPrecision(2))}×`) + `10^${e}`;
  } else s = String(Number(x.toPrecision(3)));
  return s.replace(".", ",").replace(/-/g, "−");
}

function marcas(min, max, n = 5) {
  const crudo = (max - min) / n;
  const pot = 10 ** Math.floor(Math.log10(crudo));
  const paso = [1, 2, 2.5, 5, 10].map((m) => m * pot).find((p) => p >= crudo);
  const out = [];
  for (let x = Math.ceil(min / paso - 1e-9) * paso; x <= max + paso * 1e-9; x += paso) out.push(Math.abs(x) < paso * 1e-9 ? 0 : x);
  return out;
}

function potencias(min, max) {
  const out = [];
  for (let k = Math.floor(Math.log10(min)); k <= Math.ceil(Math.log10(max)); k++) out.push(10 ** k);
  return out;
}

// Texto con superíndices para etiquetas del tipo 10^3.
function textoSVG(s) {
  return esc(s).replace(/\^(−?[0-9A-Za-z]+)/g, '<tspan baseline-shift="super" font-size="70%">$1</tspan>');
}

/**
 * Gráfico de líneas.
 * op: { series: [{nombre, puntos: [[x,y]], color?, punteada?, grosor?}], xMin, xMax, yMin, yMax,
 *       xEtiqueta, yEtiqueta, logX, logY, verticales: [{x, etiqueta}], horizontales: [{y, etiqueta}],
 *       ancho, alto, leyenda: "arriba" | "abajo" | null }
 */
function grafico(op) {
  const W = op.ancho || 640, H = op.alto || 400;
  const m = { l: 70, r: 18, t: op.leyenda === null ? 16 : 40, b: 56 };
  const tx = (x) => (op.logX ? Math.log10(x) : x);
  const ty = (y) => (op.logY ? Math.log10(y) : y);
  const pts = op.series.flatMap((s) => s.puntos).filter(([x, y]) => isFinite(tx(x)) && isFinite(ty(y)));
  const xMin = op.xMin ?? Math.min(...pts.map((p) => p[0]));
  const xMax = op.xMax ?? Math.max(...pts.map((p) => p[0]));
  const yMin = op.yMin ?? Math.min(...pts.map((p) => p[1]));
  const yMax = op.yMax ?? Math.max(...pts.map((p) => p[1]));
  const X = (x) => m.l + ((tx(x) - tx(xMin)) / (tx(xMax) - tx(xMin))) * (W - m.l - m.r);
  const Y = (y) => H - m.b - ((ty(y) - ty(yMin)) / (ty(yMax) - ty(yMin))) * (H - m.t - m.b);
  const o = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" ${FUENTE} font-size="13">`,
    `<rect width="${W}" height="${H}" fill="#ffffff"/>`];
  const mx = op.logX ? potencias(xMin, xMax) : marcas(xMin, xMax, op.marcasX || 6);
  const my = op.logY ? potencias(yMin, yMax) : marcas(yMin, yMax, op.marcasY || 5);
  for (const x of mx) {
    if (x < xMin - 1e-12 || x > xMax + 1e-12) continue;
    o.push(`<line x1="${X(x)}" y1="${m.t}" x2="${X(x)}" y2="${H - m.b}" stroke="#e3e1db"/>`);
    o.push(`<text x="${X(x)}" y="${H - m.b + 18}" text-anchor="middle" fill="#333">${textoSVG(num(x))}</text>`);
  }
  for (const y of my) {
    if (y < yMin - 1e-12 || y > yMax + 1e-12) continue;
    o.push(`<line x1="${m.l}" y1="${Y(y)}" x2="${W - m.r}" y2="${Y(y)}" stroke="#e3e1db"/>`);
    o.push(`<text x="${m.l - 8}" y="${Y(y) + 4}" text-anchor="end" fill="#333">${textoSVG(num(y))}</text>`);
  }
  o.push(`<rect x="${m.l}" y="${m.t}" width="${W - m.l - m.r}" height="${H - m.t - m.b}" fill="none" stroke="#333"/>`);
  if (op.xEtiqueta) o.push(`<text x="${m.l + (W - m.l - m.r) / 2}" y="${H - 14}" text-anchor="middle" fill="#111">${textoSVG(op.xEtiqueta)}</text>`);
  if (op.yEtiqueta) o.push(`<text transform="translate(18 ${m.t + (H - m.t - m.b) / 2}) rotate(-90)" text-anchor="middle" fill="#111">${textoSVG(op.yEtiqueta)}</text>`);
  o.push(`<clipPath id="area"><rect x="${m.l}" y="${m.t}" width="${W - m.l - m.r}" height="${H - m.t - m.b}"/></clipPath><g clip-path="url(#area)">`);
  (op.verticales || []).forEach((v, j) => {
    o.push(`<line x1="${X(v.x)}" y1="${m.t}" x2="${X(v.x)}" y2="${H - m.b}" stroke="#666" stroke-dasharray="4 4"/>`);
    // etiquetas escalonadas para que no se pisen si las líneas están cerca
    if (v.etiqueta) o.push(`<text x="${X(v.x) + 5}" y="${m.t + 16 + 15 * j}" fill="#444" font-size="12">${textoSVG(v.etiqueta)}</text>`);
  });
  for (const h of op.horizontales || []) {
    o.push(`<line x1="${m.l}" y1="${Y(h.y)}" x2="${W - m.r}" y2="${Y(h.y)}" stroke="#666" stroke-dasharray="4 4"/>`);
    if (h.etiqueta) o.push(`<text x="${W - m.r - 6}" y="${Y(h.y) - 6}" text-anchor="end" fill="#444" font-size="12">${textoSVG(h.etiqueta)}</text>`);
  }
  op.series.forEach((s, i) => {
    const d = [];
    let abierto = false;
    for (const [x, y] of s.puntos) {
      if (!isFinite(tx(x)) || !isFinite(ty(y))) { abierto = false; continue; }
      d.push(`${abierto ? "L" : "M"}${X(x).toFixed(2)} ${Y(y).toFixed(2)}`);
      abierto = true;
    }
    const color = s.color || COLORES[i % COLORES.length];
    o.push(`<path d="${d.join(" ")}" fill="none" stroke="${color}" stroke-width="${s.grosor || 2.2}"${s.punteada ? ' stroke-dasharray="7 5"' : ""} stroke-linejoin="round"/>`);
  });
  o.push("</g>");
  if (op.leyenda !== null) {
    let lx = m.l;
    op.series.forEach((s, i) => {
      if (!s.nombre) return;
      const color = s.color || COLORES[i % COLORES.length];
      o.push(`<line x1="${lx}" y1="${m.t - 16}" x2="${lx + 22}" y2="${m.t - 16}" stroke="${color}" stroke-width="3"${s.punteada ? ' stroke-dasharray="6 4"' : ""}/>`);
      o.push(`<text x="${lx + 28}" y="${m.t - 12}" fill="#111">${textoSVG(s.nombre)}</text>`);
      lx += 40 + s.nombre.length * 7.2;
    });
  }
  o.push("</svg>");
  return o.join("\n");
}

function guardar(nombre, svg) {
  fs.writeFileSync(path.join(__dirname, nombre + ".svg"), svg + "\n");
  console.log("figura:", nombre + ".svg");
}

/**
 * Barras apiladas horizontales. grupos: [{nombre, partes: [valor...]}], categorias: [nombre...]
 */
function barras(op) {
  const W = op.ancho || 640, alto = op.alturaBarra || 34, sep = op.separacion || 22;
  const m = { l: op.margenIzq || 210, r: 30, t: 54, b: 46 };
  const H = m.t + op.grupos.length * (alto + sep) - sep + m.b;
  const total = op.maximo || Math.max(...op.grupos.map((g) => g.partes.reduce((a, b) => a + b, 0)));
  const X = (v) => m.l + (v / total) * (W - m.l - m.r);
  const o = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" ${FUENTE} font-size="13">`,
    `<rect width="${W}" height="${H}" fill="#ffffff"/>`];
  let lx = m.l;
  op.categorias.forEach((c, i) => {
    o.push(`<rect x="${lx}" y="${m.t - 36}" width="14" height="14" fill="${(op.colores || COLORES)[i]}"/>`);
    o.push(`<text x="${lx + 20}" y="${m.t - 24}" fill="#111">${esc(c)}</text>`);
    lx += 34 + c.length * 7.2;
  });
  for (const v of marcas(0, total, op.marcas || 5)) {
    o.push(`<line x1="${X(v)}" y1="${m.t - 6}" x2="${X(v)}" y2="${H - m.b}" stroke="#e3e1db"/>`);
    o.push(`<text x="${X(v)}" y="${H - m.b + 18}" text-anchor="middle" fill="#333">${num(v)}</text>`);
  }
  op.grupos.forEach((g, k) => {
    const y = m.t + k * (alto + sep);
    o.push(`<text x="${m.l - 10}" y="${y + alto / 2 + 5}" text-anchor="end" fill="#111">${esc(g.nombre)}</text>`);
    let acum = 0;
    g.partes.forEach((v, i) => {
      if (!v) return;
      o.push(`<rect x="${X(acum)}" y="${y}" width="${X(acum + v) - X(acum)}" height="${alto}" fill="${(op.colores || COLORES)[i]}"/>`);
      o.push(`<text x="${(X(acum) + X(acum + v)) / 2}" y="${y + alto / 2 + 5}" text-anchor="middle" fill="#fff" font-weight="bold">${num(v)}</text>`);
      acum += v;
    });
  });
  if (op.xEtiqueta) o.push(`<text x="${m.l + (W - m.l - m.r) / 2}" y="${H - 10}" text-anchor="middle" fill="#111">${esc(op.xEtiqueta)}</text>`);
  o.push("</svg>");
  return o.join("\n");
}

/** Diagrama de pasos en fila: cajas con número y texto, unidas por flechas. */
function pasos(lista, op = {}) {
  const W = op.ancho || 640, porFila = op.porFila || 3, cw = (W - 40 - (porFila - 1) * 30) / porFila, ch = op.altoCaja || 92;
  const filas = Math.ceil(lista.length / porFila);
  const H = 20 + filas * ch + (filas - 1) * 40 + 20;
  const o = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" ${FUENTE} font-size="13">`,
    `<rect width="${W}" height="${H}" fill="#ffffff"/>`,
    `<defs><marker id="flecha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#555"/></marker></defs>`];
  const pos = lista.map((_, i) => {
    const f = Math.floor(i / porFila), c = f % 2 === 0 ? i % porFila : porFila - 1 - (i % porFila);
    return { x: 20 + c * (cw + 30), y: 20 + f * (ch + 40) };
  });
  lista.forEach((p, i) => {
    const { x, y } = pos[i];
    o.push(`<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="10" fill="#f3f5fc" stroke="${COLORES[0]}" stroke-width="1.5"/>`);
    o.push(`<text x="${x + 12}" y="${y + 24}" fill="${COLORES[0]}" font-weight="bold" font-size="14">${esc(p.titulo)}</text>`);
    (p.lineas || []).forEach((l, j) => o.push(`<text x="${x + 12}" y="${y + 46 + j * 17}" fill="#222">${esc(l)}</text>`));
    if (i + 1 < lista.length) {
      const a = pos[i], b = pos[i + 1];
      if (a.y === b.y) {
        const izq = b.x > a.x;
        o.push(`<line x1="${izq ? a.x + cw : a.x}" y1="${a.y + ch / 2}" x2="${izq ? b.x - 2 : b.x + cw + 2}" y2="${b.y + ch / 2}" stroke="#555" stroke-width="1.6" marker-end="url(#flecha)"/>`);
      } else {
        o.push(`<line x1="${a.x + cw / 2}" y1="${a.y + ch}" x2="${b.x + cw / 2}" y2="${b.y - 2}" stroke="#555" stroke-width="1.6" marker-end="url(#flecha)"/>`);
      }
    }
  });
  o.push("</svg>");
  return o.join("\n");
}

// ---------------------------------------------------------------------------
// Modelo: fichas metaestables con barrera Ea que al caer liberan Q y pasan η·Q
// ---------------------------------------------------------------------------
function rng(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const DEFECTO = { modo: "fila", ancho: 24, alto: 1, Ea: 5, Q: 8, eta: 0.7, E0: 6, catalizador: false, variabilidad: 0, semilla: 1 };
function normalizar(p) {
  const x = { ...DEFECTO, ...p };
  if (x.modo === "fila") x.alto = 1;
  if (x.modo === "red") { x.ancho = p.ancho ?? 25; x.alto = p.alto ?? 15; }
  return x;
}
function barreras(x) {
  const n = x.ancho * x.alto, r = rng(x.semilla), base = x.catalizador ? x.Ea / 2 : x.Ea;
  return Float64Array.from({ length: n }, () => base * (1 + x.variabilidad * (2 * r() - 1)));
}
const inicio = (x) => (x.modo === "fila" ? 0 : Math.floor(x.alto / 2) * x.ancho + Math.floor(x.ancho / 2));
function vecinos(i, x) {
  const c = i % x.ancho, f = Math.floor(i / x.ancho);
  if (x.modo === "fila") return c + 1 < x.ancho ? [i + 1] : [];
  const out = [];
  if (c > 0) out.push(i - 1);
  if (c + 1 < x.ancho) out.push(i + 1);
  if (f > 0) out.push(i - x.ancho);
  if (f + 1 < x.alto) out.push(i + x.ancho);
  return out;
}
function simular(p) {
  const x = normalizar(p), n = x.ancho * x.alto, Ea = barreras(x);
  const energia = new Float64Array(n), caida = new Uint8Array(n), pasos = [];
  const i0 = inicio(x);
  energia[i0] = x.E0;
  let candidatas = new Set([i0]), caidas = 0;
  const porVecina = x.modo === "fila" ? x.eta * x.Q : (x.eta * x.Q) / 4;
  while (candidatas.size) {
    const caen = [...candidatas].filter((i) => !caida[i] && energia[i] >= Ea[i] - 1e-12);
    if (!caen.length) break;
    for (const i of caen) caida[i] = 1;
    caidas += caen.length;
    pasos.push(caen.length);
    const sig = new Set();
    for (const i of caen) for (const j of vecinos(i, x)) { if (caida[j]) continue; energia[j] += porVecina; sig.add(j); }
    candidatas = sig;
  }
  return { pasos, caidas, total: n, liberada: caidas * x.Q, completa: caidas === n, Ea };
}
// Perfil de energía de una ficha: reactivos a Q, barrera Ea por encima, productos en 0.
function perfil(x, n = 200) {
  const Ea = x.catalizador ? x.Ea / 2 : x.Ea, pts = [];
  for (let k = 0; k <= n; k++) {
    const s = k / n;
    let e;
    if (s <= 0.15) e = x.Q;
    else if (s <= 0.45) e = x.Q + (Ea * (1 - Math.cos((Math.PI * (s - 0.15)) / 0.3))) / 2;
    else if (s <= 0.85) e = ((x.Q + Ea) * (1 + Math.cos((Math.PI * (s - 0.45)) / 0.4))) / 2;
    else e = 0;
    pts.push([s, e]);
  }
  return pts;
}

const f4 = (x) => Number(x.toPrecision(4));
const fila = (p = {}) => simular({ modo: "fila", ...p });
const red = (p = {}) => simular({ modo: "red", Ea: 1.2, ...p });
const informe = (n, r) => console.log(`${n.padEnd(38)} caídas ${r.caidas}/${r.total}, pasos ${r.pasos.length}, liberada ${r.liberada}`);

// ---------------------------------------------------------------------------
// Cifras del texto
// ---------------------------------------------------------------------------
informe("Fila base (Ea 5, Q 8, η 0,7, E0 6)", fila());
informe("Fila, Ea = 6", fila({ Ea: 6 }));
informe("Fila, Ea = 6 con catalizador", fila({ Ea: 6, catalizador: true }));
informe("Fila, empujón 4,5", fila({ E0: 4.5 }));
for (const v of [0.1, 0.2]) { const r = fila({ variabilidad: v }); informe(`Fila, variabilidad ${v} (barreras ${f4(Math.min(...r.Ea))}–${f4(Math.max(...r.Ea))})`, r); }
informe("Red base (Ea 1,2)", red());
for (const ea of [1.4, 1.5]) informe(`Red, Ea = ${ea}`, red({ Ea: ea }));
for (const v of [0.2, 0.3]) informe(`Red, Ea = 1,3, variabilidad ${v}`, red({ Ea: 1.3, variabilidad: v }));
console.log(`Red base, fichas que caen por paso: ${red().pasos.join(" ")}`);

// La ficha real: 48 × 24 × 7,5 mm (alto × ancho × espesor)
{
  const h = 0.048, e = 0.0075, g = 9.81, rho = 1200; // densidad supuesta de un plástico, kg/m³
  const m = rho * h * 0.024 * e;
  const subida = Math.hypot(h, e) / 2 - h / 2, bajada = h / 2 - e / 2;
  console.log(`Ficha 48 × 24 × 7,5 mm: subida del centro de masa ${f4(subida * 1000)} mm, bajada ${f4(bajada * 1000)} mm, Ea/Q = ${f4(subida / bajada)}`);
  console.log(`Con ρ = ${rho} kg/m³: m = ${f4(m * 1000)} g, Ea = ${f4(m * g * subida * 1e6)} µJ, Q = ${f4(m * g * bajada * 1e3)} mJ`);
  // Whitehead: fichas geométricamente semejantes, cada una 1,5 veces la anterior
  const s = 1.5, k = 12;
  console.log(`Escala 1,5: energía por ficha × ${f4(s ** 4)}; tras ${k} saltos × ${f4(s ** (4 * k))}; altura de la ficha 13 empezando en 5 mm: ${f4(5 * s ** k)} mm`);
  console.log(`η mínima para que cada ficha tire a la siguiente, más grande: s⁴ · Ea/Q = ${f4(s ** 4 * subida / bajada)}`);
  console.log(`Q de la última sobre Ea de la primera: ${f4(s ** (4 * k) / (subida / bajada))}`);
}
// Fisher–KPP: v = 2√(D r); en el modelo de red, el frente avanza un sitio por paso en distancia de Manhattan.
console.log(`Percolación de sitios en red cuadrada: p_c ≈ 0,593 (Stauffer y Aharony)`);

// ---------------------------------------------------------------------------
// Figura 1: perfil de energía
// ---------------------------------------------------------------------------
guardar("perfil", grafico({
  series: [
    { nombre: "Sin catalizador (Ea = 5)", puntos: perfil({ Q: 8, Ea: 5 }), color: COLORES[0] },
    { nombre: "Con catalizador (Ea = 2,5)", puntos: perfil({ Q: 8, Ea: 5, catalizador: true }), color: COLORES[1], punteada: true },
  ],
  xMin: 0, xMax: 1, yMin: 0, yMax: 14,
  horizontales: [{ y: 8, etiqueta: "reactivos, Q = 8" }],
  xEtiqueta: "Coordenada de reacción (adimensional)", yEtiqueta: "Energía (unidades arbitrarias)",
}));

// ---------------------------------------------------------------------------
// Figura 2: el umbral en la fila y en la red
// ---------------------------------------------------------------------------
{
  const rs = Array.from({ length: 81 }, (_, i) => 0.6 + i * 0.01);
  guardar("umbral", grafico({
    series: [
      { nombre: "Fila (24 fichas)", puntos: rs.map((u) => { const r = fila({ Ea: u * 0.7 * 8, E0: 100 }); return [u, r.caidas / r.total]; }), color: COLORES[0] },
      { nombre: "Red (25 × 15)", puntos: rs.map((u) => { const r = red({ Ea: (u * 0.7 * 8) / 4, E0: 100 }); return [u, r.caidas / r.total]; }), color: COLORES[1], punteada: true },
    ],
    xMin: 0.6, xMax: 1.4, yMin: 0, yMax: 1.05,
    verticales: [{ x: 1, etiqueta: "umbral" }],
    xEtiqueta: "Barrera relativa: Ea / (η Q) en la fila, Ea / (η Q / 4) en la red", yEtiqueta: "Fracción de fichas caídas",
  }));
}

// ---------------------------------------------------------------------------
// Figura 3: robustez frente a barreras irregulares (promedio de 100 semillas)
// ---------------------------------------------------------------------------
{
  const vs = Array.from({ length: 26 }, (_, i) => i * 0.02);
  const prom = (f) => vs.map((v) => { let s = 0; for (let k = 1; k <= 100; k++) s += f(v, k); return [v, s / 100]; });
  const datosFila = prom((v, k) => { const r = fila({ variabilidad: v, semilla: k }); return r.caidas / r.total; });
  const datosRed = prom((v, k) => { const r = red({ Ea: 1.3, variabilidad: v, semilla: k }); return r.caidas / r.total; });
  guardar("variabilidad", grafico({
    series: [
      { nombre: "Fila (Ea = 5, η Q = 5,6)", puntos: datosFila, color: COLORES[0] },
      { nombre: "Red (Ea = 1,3, η Q / 4 = 1,4)", puntos: datosRed, color: COLORES[1] },
    ],
    xMin: 0, xMax: 0.5, yMin: 0, yMax: 1.05,
    xEtiqueta: "Variabilidad de las barreras (±)", yEtiqueta: "Fracción caída (media de 100 semillas)",
  }));
  const at = (d, v) => d.find(([x]) => Math.abs(x - v) < 1e-9)[1];
  console.log(`Fracción media caída con variabilidad 0,2: fila ${f4(at(datosFila, 0.2))}, red ${f4(at(datosRed, 0.2))}; con 0,5: fila ${f4(at(datosFila, 0.5))}, red ${f4(at(datosRed, 0.5))}`);
}

// ---------------------------------------------------------------------------
// Figura 4: el frente en la red
// ---------------------------------------------------------------------------
{
  const serie = (r) => r.pasos.map((c, k) => [k + 1, c]);
  guardar("frente", grafico({
    series: [
      { nombre: "Red, Ea = 1,2", puntos: serie(red()), color: COLORES[0] },
      { nombre: "Ea = 1,3, variabilidad 0,3", puntos: serie(red({ Ea: 1.3, variabilidad: 0.3 })), color: COLORES[1] },
    ],
    xMin: 1, xMax: 27, yMin: 0, yMax: 45,
    xEtiqueta: "Paso", yEtiqueta: "Fichas que caen en el paso",
  }));
}
