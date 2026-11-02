const test = require("node:test");
const assert = require("node:assert/strict");
const R = require("../src/reaccion.js");

test("fila: si η·Q alcanza Ea, caen todas, una por paso", () => {
  const r = R.simular({ modo: "fila", ancho: 20, Ea: 5, Q: 8, eta: 0.7, E0: 6 });
  assert.equal(r.caidas, 20);
  assert.equal(r.pasos.length, 20);
  assert.ok(r.completa);
  assert.equal(r.liberada, 160);
});

test("fila: si η·Q no alcanza Ea, solo cae la primera", () => {
  const r = R.simular({ modo: "fila", ancho: 20, Ea: 5, Q: 6, eta: 0.7, E0: 6 });
  assert.equal(r.caidas, 1);
  assert.equal(R.seSostieneEnFila({ Ea: 5, Q: 6, eta: 0.7 }), false);
});

test("sin empujón suficiente no pasa nada (metaestable)", () => {
  const r = R.simular({ modo: "fila", ancho: 20, Ea: 5, Q: 8, eta: 0.7, E0: 4.9 });
  assert.equal(r.caidas, 0);
  assert.equal(r.pasos.length, 0);
});

test("el catalizador baja la barrera y destraba la cadena", () => {
  const p = { modo: "fila", ancho: 20, Ea: 6, Q: 6, eta: 0.7, E0: 6 };
  assert.equal(R.simular(p).caidas, 1);
  assert.equal(R.simular({ ...p, catalizador: true }).caidas, 20);
  assert.equal(R.seSostieneEnFila({ ...p, catalizador: true }), true);
});

test("red: con energía de sobra cae todo en tantos pasos como la distancia al centro", () => {
  const r = R.simular({ modo: "red", ancho: 9, alto: 7, Ea: 1, Q: 8, eta: 1, E0: 2 });
  assert.equal(r.caidas, 63);
  // Centro (4,3): la esquina más lejana está a 4 + 3 = 7 pasos, más el paso inicial.
  assert.equal(r.pasos.length, 8);
});

test("red: si a cada vecina le llega η·Q/4 < Ea, la cadena muere en el centro", () => {
  const r = R.simular({ modo: "red", ancho: 9, alto: 7, Ea: 3, Q: 8, eta: 1, E0: 3 });
  assert.equal(r.caidas, 1);
});

test("la variabilidad es repetible con la misma semilla", () => {
  const a = R.barreras({ ancho: 30, Ea: 5, variabilidad: 0.3, semilla: 7 });
  const b = R.barreras({ ancho: 30, Ea: 5, variabilidad: 0.3, semilla: 7 });
  const c = R.barreras({ ancho: 30, Ea: 5, variabilidad: 0.3, semilla: 8 });
  assert.deepEqual([...a], [...b]);
  assert.notDeepEqual([...a], [...c]);
  assert.ok([...a].every((e) => e >= 3.5 - 1e-9 && e <= 6.5 + 1e-9));
});

test("el perfil arranca en Q, sube Ea por encima y termina en 0", () => {
  const pts = R.perfil({ Ea: 5, Q: 8 });
  assert.equal(pts[0][1], 8);
  assert.equal(pts[pts.length - 1][1], 0);
  const pico = Math.max(...pts.map((p) => p[1]));
  assert.ok(Math.abs(pico - 13) < 1e-9, "la barrera mide exactamente Ea sobre los reactivos");
  const conCat = Math.max(...R.perfil({ Ea: 5, Q: 8, catalizador: true }).map((p) => p[1]));
  assert.ok(Math.abs(conCat - 10.5) < 1e-9);
});
