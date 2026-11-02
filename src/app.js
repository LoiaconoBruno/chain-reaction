// Interfaz: arma los parámetros, corre Reaccion.simular y anima los pasos.
(() => {
  const $ = (id) => document.getElementById(id);
  const fmt = (x) => Number(x.toFixed(2)).toLocaleString("es-AR");
  const PRESETS = {
    fila: { ancho: 24, alto: 1, Ea: 5, Q: 8, eta: 0.7, E0: 6, variabilidad: 0, catalizador: false },
    red: { ancho: 25, alto: 15, Ea: 1.2, Q: 8, eta: 0.7, E0: 6, variabilidad: 0, catalizador: false },
  };
  const SLIDERS = ["Ea", "Q", "eta", "E0", "variabilidad"];
  let params = { modo: "fila", catalizador: false, semilla: 1, ...PRESETS.fila };
  let resultado = null;
  let paso = 0;      // cuántos pasos de la animación ya se mostraron
  let timer = null;

  function leer() {
    for (const k of SLIDERS) {
      params[k] = parseFloat($(k).value);
      $("v-" + k).textContent = k === "variabilidad" ? Math.round(params[k] * 100) + " %" : fmt(params[k]);
    }
    params.catalizador = $("catalizador").checked;
  }

  function escribir() {
    $("modo").value = params.modo;
    for (const k of SLIDERS) $(k).value = params[k];
    $("catalizador").checked = params.catalizador;
    leer();
  }

  function pista() {
    const Ea = params.catalizador ? params.Ea / 2 : params.Ea;
    const llega = params.modo === "fila" ? params.eta * params.Q : (params.eta * params.Q) / 4;
    const dondeLlega = params.modo === "fila" ? "a la ficha siguiente" : "a cada una de sus 4 vecinas";
    const ok = llega >= Ea;
    $("pista").innerHTML = `Llega ${fmt(llega)} ${dondeLlega} y la barrera es ${fmt(Ea)}${params.variabilidad ? " (en promedio)" : ""}. `
      + (params.E0 < Ea ? "<b>El empujón no alcanza para tirar la primera.</b>"
        : ok ? "<b>La cadena puede seguir.</b>" : "<b>La cadena se corta enseguida.</b>");
  }

  function reiniciar() {
    clearInterval(timer); timer = null;
    leer();
    resultado = Reaccion.simular(params);
    paso = 0;
    pista();
    dibujarTablero();
    dibujarPerfil();
    stats(false);
  }

  function empujar() {
    reiniciar();
    const demora = params.modo === "fila" ? 90 : 55;
    timer = setInterval(() => {
      paso++;
      dibujarTablero();
      if (paso >= resultado.pasos.length) { clearInterval(timer); timer = null; stats(true); }
    }, demora);
    if (!resultado.pasos.length) { clearInterval(timer); timer = null; stats(true); }
  }

  function stats(final) {
    if (!final) { for (const id of ["s-caidas", "s-pasos", "s-energia", "s-res"]) $(id).textContent = "—"; return; }
    const r = resultado;
    $("s-caidas").textContent = `${r.caidas} / ${r.total}`;
    $("s-pasos").textContent = r.pasos.length;
    $("s-energia").textContent = fmt(r.liberada);
    $("s-res").textContent = r.caidas === 0 ? "Nada" : r.completa ? "Cadena completa" : r.caidas === 1 ? "Se cortó" : "Cadena parcial";
  }

  function dibujarTablero() {
    const canvas = $("tablero");
    const filas = params.modo === "fila" ? 1 : params.alto;
    const cols = params.ancho;
    const alto = params.modo === "fila" ? 120 : Math.min(360, Math.round((canvas.clientWidth / cols) * filas) + 16);
    const { ctx, w, h } = Grafico.preparar(canvas, alto);
    const c = Grafico.colores();
    const estado = new Uint8Array(cols * filas); // 0 en pie, 1 cayendo, 2 caída
    for (let t = 0; t < paso && t < resultado.pasos.length; t++) {
      for (const i of resultado.pasos[t]) estado[i] = t === paso - 1 ? 1 : 2;
    }
    const color = [c.series[0], c.series[1], c.muted];
    if (params.modo === "fila") {
      const celda = (w - 16) / cols;
      const fw = Math.max(3, celda * 0.28), fh = Math.min(80, celda * 3);
      const base = h - 20;
      for (let i = 0; i < cols; i++) {
        const x = 8 + i * celda + celda / 2;
        ctx.save();
        ctx.translate(x, base);
        ctx.rotate(estado[i] === 2 ? Math.PI / 2.4 : estado[i] === 1 ? Math.PI / 6 : 0);
        ctx.fillStyle = color[estado[i]];
        ctx.fillRect(-fw / 2, -fh, fw, fh);
        ctx.restore();
      }
      ctx.strokeStyle = c.border; ctx.beginPath(); ctx.moveTo(4, base + 1); ctx.lineTo(w - 4, base + 1); ctx.stroke();
    } else {
      const celda = Math.min((w - 16) / cols, (h - 16) / filas);
      const ox = (w - celda * cols) / 2, oy = (h - celda * filas) / 2;
      for (let i = 0; i < cols * filas; i++) {
        const x = ox + (i % cols) * celda, y = oy + Math.floor(i / cols) * celda;
        ctx.fillStyle = color[estado[i]];
        ctx.globalAlpha = estado[i] === 2 ? 0.45 : 1;
        ctx.fillRect(x + 1, y + 1, celda - 2, celda - 2);
      }
      ctx.globalAlpha = 1;
    }
  }

  function dibujarPerfil() {
    const pts = Reaccion.perfil(params);
    const series = [{ nombre: params.catalizador ? "Con catalizador" : "Sin catalizador", puntos: pts }];
    if (params.catalizador) series.push({ nombre: "Sin catalizador", puntos: Reaccion.perfil({ ...params, catalizador: false }), punteada: true });
    const Ea = params.catalizador ? params.Ea / 2 : params.Ea;
    Grafico.lineas($("perfil"), {
      series,
      xMin: 0, xMax: 1, yMin: 0, yMax: params.Q + params.Ea + 1,
      xEtiqueta: "coordenada de reacción (reactivos → productos)",
      yEtiqueta: "energía",
      horizontales: [
        { y: params.Q, etiqueta: `reactivos (Q = ${fmt(params.Q)} sobre los productos)` },
        { y: params.Q + Ea, etiqueta: `barrera: Ea = ${fmt(Ea)}` },
      ],
      alto: 220,
    });
  }

  $("modo").addEventListener("change", () => {
    params = { ...params, modo: $("modo").value, ...PRESETS[$("modo").value] };
    escribir();
    reiniciar();
  });
  for (const k of SLIDERS) $(k).addEventListener("input", reiniciar);
  $("catalizador").addEventListener("change", reiniciar);
  $("empujar").addEventListener("click", empujar);
  $("reiniciar").addEventListener("click", reiniciar);
  window.addEventListener("resize", () => { dibujarTablero(); dibujarPerfil(); });

  escribir();
  reiniciar();
})();
