// Reacción en cadena con fichas de dominó como metáfora.
//
// Cada ficha está en un estado metaestable: quieta pero no a salvo. Cae si la
// energía que recibe alcanza su energía de activación (Ea). Al caer, pasa al
// estado de productos, que está Q más abajo, y le entrega a sus vecinas una
// fracción η de esa energía. Si lo que llega a la siguiente alcanza su Ea, la
// cadena sigue.
//
//   fila: la energía va solo hacia adelante (como una hilera de dominó).
//   red:  va en las cuatro direcciones, repartida (más parecido a una
//         detonación, que se propaga hacia todos lados).
const Reaccion = (() => {
  // Generador pseudoaleatorio con semilla (mulberry32), para resultados repetibles.
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

  const DEFECTO = {
    modo: "fila",
    ancho: 24,
    alto: 1,
    Ea: 5,          // energía de activación de cada ficha
    Q: 8,           // energía que libera cada ficha al caer
    eta: 0.7,       // fracción de Q que llega a las vecinas
    E0: 6,          // empujón inicial
    catalizador: false, // baja Ea a la mitad
    variabilidad: 0,    // dispersión de Ea entre fichas (0 a 0,5)
    semilla: 1,
  };

  function normalizar(p) {
    const x = { ...DEFECTO, ...p };
    if (x.modo === "fila") x.alto = 1;
    return x;
  }

  function barreras(p) {
    const x = normalizar(p);
    const n = x.ancho * x.alto;
    const r = rng(x.semilla);
    const base = x.catalizador ? x.Ea / 2 : x.Ea;
    const out = new Float64Array(n);
    for (let i = 0; i < n; i++) out[i] = base * (1 + x.variabilidad * (2 * r() - 1));
    return out;
  }

  function inicio(x) {
    return x.modo === "fila" ? 0 : Math.floor(x.alto / 2) * x.ancho + Math.floor(x.ancho / 2);
  }

  function vecinos(i, x) {
    const c = i % x.ancho;
    const f = Math.floor(i / x.ancho);
    if (x.modo === "fila") return c + 1 < x.ancho ? [i + 1] : [];
    const out = [];
    if (c > 0) out.push(i - 1);
    if (c + 1 < x.ancho) out.push(i + 1);
    if (f > 0) out.push(i - x.ancho);
    if (f + 1 < x.alto) out.push(i + x.ancho);
    return out;
  }

  // Devuelve { pasos: [[índices que caen en cada paso]], caidas, total, liberada, completa }.
  function simular(p) {
    const x = normalizar(p);
    const n = x.ancho * x.alto;
    const Ea = barreras(x);
    const energia = new Float64Array(n);
    const caida = new Uint8Array(n);
    const pasos = [];
    const i0 = inicio(x);
    energia[i0] = x.E0;
    let candidatas = new Set([i0]);
    let caidas = 0;
    // En la red, cada ficha reparte η·Q entre sus 4 lados (los bordes pierden energía).
    const porVecina = x.modo === "fila" ? x.eta * x.Q : (x.eta * x.Q) / 4;

    while (candidatas.size) {
      const caen = [...candidatas].filter((i) => !caida[i] && energia[i] >= Ea[i] - 1e-12);
      if (!caen.length) break;
      caen.sort((a, b) => a - b);
      for (const i of caen) caida[i] = 1;
      caidas += caen.length;
      pasos.push(caen);
      const siguientes = new Set();
      for (const i of caen) {
        for (const j of vecinos(i, x)) {
          if (caida[j]) continue;
          energia[j] += porVecina;
          siguientes.add(j);
        }
      }
      candidatas = siguientes;
    }
    return { pasos, caidas, total: n, liberada: caidas * x.Q, completa: caidas === n, barreras: Ea };
  }

  // En una fila sin variabilidad, la cadena se sostiene si lo que llega a cada
  // ficha alcanza su barrera: η·Q ≥ Ea (o Ea/2 con catalizador).
  function seSostieneEnFila(p) {
    const x = normalizar(p);
    const Ea = x.catalizador ? x.Ea / 2 : x.Ea;
    return x.eta * x.Q >= Ea;
  }

  // Perfil de energía a lo largo de la "coordenada de reacción", para dibujar:
  // reactivos a altura Q, barrera de altura Ea, productos en 0.
  function perfil(p, n = 120) {
    const x = normalizar(p);
    const Ea = x.catalizador ? x.Ea / 2 : x.Ea;
    const pts = [];
    for (let k = 0; k <= n; k++) {
      const s = k / n; // 0 = reactivos, 1 = productos
      let e;
      if (s <= 0.15) e = x.Q;
      else if (s <= 0.45) e = x.Q + (Ea * (1 - Math.cos((Math.PI * (s - 0.15)) / 0.3))) / 2;
      else if (s <= 0.85) e = ((x.Q + Ea) * (1 + Math.cos((Math.PI * (s - 0.45)) / 0.4))) / 2;
      else e = 0;
      pts.push([s, e]);
    }
    return pts;
  }

  return { DEFECTO, rng, barreras, vecinos, simular, seSostieneEnFila, perfil };
})();

if (typeof module !== "undefined") module.exports = Reaccion;
