// =====================================================
// REHABPOD — GRÁFICOS DE PROGRESO CLAROS
//
// Lógica pura (sin DOM) que convierte el historial en:
//  · una frase simple ("tu reacción mejoró 8 %");
//  · series por día (reacción y precisión) y semanas entrenadas;
//  · el DISEÑO de cada gráfico (ejes, marcas, puntos ya en coordenadas);
//  · SVG accesible a partir de ese diseño.
// El mismo diseño lo usa el informe PDF (js/informe.js), así la pantalla y el
// PDF muestran exactamente los mismos números.
//
// Se carga antes de app.js; expone `RehabGraficos` y module.exports.
// =====================================================

(function (raiz) {
  "use strict";

  const METAS = raiz.RehabMetas || (typeof require === "function" ? require("./metas.js") : null);
  const DIA_MS = 86400000;

  // -----------------------------------------------------
  // Datos
  // -----------------------------------------------------
  const esNumero = (n) => typeof n === "number" && Number.isFinite(n);

  function fechaDe(s) {
    const f = s && s.timestamp ? new Date(s.timestamp) : new Date(s && s.fecha);
    return Number.isNaN(f.getTime()) ? null : f;
  }

  function inicioDelDia(f) {
    return new Date(f.getFullYear(), f.getMonth(), f.getDate());
  }

  /** Sesiones de los últimos `dias` días (null = todas), opcionalmente de un solo modo. */
  function filtrar(historial, o) {
    o = o || {};
    const ahora = o.ahora || new Date();
    const desde = o.dias ? inicioDelDia(ahora).getTime() - (o.dias - 1) * DIA_MS : -Infinity;
    const hasta = o.hasta !== undefined ? o.hasta : Infinity;
    return (historial || [])
      .map((s) => ({ s, f: fechaDe(s) }))
      .filter(({ s, f }) => f && f.getTime() >= desde && f.getTime() < hasta && (!o.modo || s.modo === o.modo))
      .map(({ s }) => s);
  }

  function modosDisponibles(historial) {
    return [...new Set((historial || []).map((s) => s.modo).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  }

  const media = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

  function estadisticas(sesiones) {
    const tiempos = sesiones.map((s) => s.promedio).filter((n) => esNumero(n) && n > 0);
    const mejores = sesiones.map((s) => s.mejor).filter((n) => esNumero(n) && n > 0);
    const a = sesiones.reduce((t, s) => t + Number(s.aciertos || 0), 0);
    const e = sesiones.reduce((t, s) => t + Number(s.errores || 0), 0);
    return {
      sesiones: sesiones.length,
      promedio: media(tiempos),
      mejor: mejores.length ? Math.min(...mejores) : null,
      aciertos: a,
      errores: e,
      precision: a + e > 0 ? (a / (a + e)) * 100 : null,
    };
  }

  /** Un punto por día entrenado (varias sesiones el mismo día se promedian). */
  function porDia(sesiones) {
    const mapa = new Map();
    sesiones.forEach((s) => {
      const f = fechaDe(s);
      if (!f) return;
      const d = inicioDelDia(f);
      const clave = d.getTime();
      if (!mapa.has(clave)) mapa.set(clave, { t: clave, sesiones: [] });
      mapa.get(clave).sesiones.push(s);
    });
    return [...mapa.values()]
      .sort((x, y) => x.t - y.t)
      .map((g) => ({ t: g.t, ...estadisticas(g.sesiones) }));
  }

  /**
   * Compara el periodo actual con el anterior de la misma duración y devuelve
   * una frase clara. `dias` null = todo el historial (sin comparación).
   */
  function comparar(historial, o) {
    o = o || {};
    const ahora = o.ahora || new Date();
    const actualSes = filtrar(historial, { dias: o.dias, modo: o.modo, ahora });
    const actual = estadisticas(actualSes);
    let previo = null;
    if (o.dias) {
      const finPrevio = inicioDelDia(ahora).getTime() - (o.dias - 1) * DIA_MS;
      const iniPrevio = finPrevio - o.dias * DIA_MS;
      const previoSes = (historial || []).filter((s) => {
        const f = fechaDe(s);
        return f && f.getTime() >= iniPrevio && f.getTime() < finPrevio && (!o.modo || s.modo === o.modo);
      });
      previo = estadisticas(previoSes);
    }

    const r = { actual, previo, cambioReaccion: null, cambioPrecision: null, tendencia: "sin-datos", mensaje: "" };

    if (!actual.sesiones) {
      r.mensaje = "Todavía no hay entrenamientos en este periodo. Haz uno y aquí verás tu evolución.";
      return r;
    }

    if (previo && previo.sesiones && esNumero(previo.promedio) && esNumero(actual.promedio)) {
      // Menos segundos = mejor: el cambio positivo es una mejora.
      r.cambioReaccion = ((previo.promedio - actual.promedio) / previo.promedio) * 100;
    }
    if (previo && previo.sesiones && esNumero(previo.precision) && esNumero(actual.precision)) {
      r.cambioPrecision = actual.precision - previo.precision;
    }

    const c = r.cambioReaccion;
    if (c === null) {
      r.tendencia = "nuevo";
      const pr = esNumero(actual.precision) ? ` Tu precisión es de ${Math.round(actual.precision)} %.` : "";
      r.mensaje = `Hiciste ${actual.sesiones} ${actual.sesiones === 1 ? "entrenamiento" : "entrenamientos"} en este periodo.${pr}`;
      if (o.dias) r.mensaje += " Cuando tengas más días, aquí verás cómo cambia frente al periodo anterior.";
    } else if (Math.abs(c) < 3) {
      r.tendencia = "estable";
      r.mensaje = "Tu tiempo de reacción se mantiene estable frente al periodo anterior.";
    } else if (c > 0) {
      r.tendencia = "mejora";
      r.mensaje = `Tu tiempo de reacción mejoró ${Math.round(c)} % frente al periodo anterior. ¡Buen avance!`;
    } else {
      r.tendencia = "baja";
      r.mensaje = `Tu tiempo de reacción subió ${Math.round(-c)} % frente al periodo anterior. Es normal si probaste ejercicios más difíciles.`;
    }

    const cp = r.cambioPrecision;
    if (cp !== null && Math.abs(cp) >= 3) {
      r.mensaje += cp > 0 ? ` Tu precisión subió ${Math.round(cp)} puntos.` : ` Tu precisión bajó ${Math.round(-cp)} puntos.`;
    }
    return r;
  }

  /** Días entrenados en cada una de las últimas `n` semanas (lunes a domingo). */
  function semanas(historial, o) {
    o = o || {};
    const n = o.n || 8;
    const ahora = o.ahora || new Date();
    const dias = METAS.diasConSesion(historial);
    const lunesActual = new Date(METAS.claveSemana(ahora) + "T00:00:00");
    const res = [];
    for (let i = n - 1; i >= 0; i--) {
      const lunes = new Date(lunesActual);
      lunes.setDate(lunesActual.getDate() - 7 * i);
      let hechos = 0;
      for (let k = 0; k < 7; k++) {
        const d = new Date(lunes);
        d.setDate(lunes.getDate() + k);
        if (dias.has(METAS.claveDia(d))) hechos++;
      }
      res.push({ t: lunes.getTime(), dias: hechos, actual: i === 0 });
    }
    return res;
  }

  // -----------------------------------------------------
  // Diseño de los gráficos (coordenadas)
  // -----------------------------------------------------
  /** Marcas "bonitas" para un eje (p. ej. 0.4, 0.6, 0.8). */
  function marcasBonitas(min, max, cuantas) {
    cuantas = cuantas || 4;
    if (!(max > min)) {
      const c = min || 1;
      min = c - Math.abs(c) * 0.1 - 0.05;
      max = c + Math.abs(c) * 0.1 + 0.05;
    }
    const bruto = (max - min) / cuantas;
    const pot = Math.pow(10, Math.floor(Math.log10(bruto)));
    const f = bruto / pot;
    const paso = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * pot;
    const ini = Math.floor(min / paso + 1e-9) * paso;
    const fin = Math.ceil(max / paso - 1e-9) * paso;
    const marcas = [];
    for (let v = ini; v <= fin + paso / 2; v += paso) marcas.push(Number(v.toFixed(10)));
    return marcas;
  }

  const MARGEN = { izq: 46, der: 14, arr: 16, aba: 28 };

  const fechaCorta = (t) => {
    const d = new Date(t);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  /**
   * Gráfico de línea. puntos: [{t, v}]. Opciones: ancho, alto, min, max (forzar
   * eje), formato (v → texto), mejor: "min" | "max" | null (marca el mejor punto).
   */
  function disenoLinea(puntos, o) {
    o = o || {};
    const ancho = o.ancho || 340;
    const alto = o.alto || 190;
    const m = MARGEN;
    const areaW = ancho - m.izq - m.der;
    const areaH = alto - m.arr - m.aba;
    const formato = o.formato || ((v) => String(v));

    const vs = puntos.map((p) => p.v);
    const marcas = marcasBonitas(o.min !== undefined ? o.min : Math.min(...vs), o.max !== undefined ? o.max : Math.max(...vs), 4);
    const y0 = marcas[0];
    const y1 = marcas[marcas.length - 1];
    const py = (v) => m.arr + areaH - ((v - y0) / (y1 - y0)) * areaH;

    const t0 = puntos[0].t;
    const t1 = puntos[puntos.length - 1].t;
    const px = (t) => (t1 === t0 ? m.izq + areaW / 2 : m.izq + ((t - t0) / (t1 - t0)) * areaW);

    const pts = puntos.map((p) => ({ x: px(p.t), y: py(p.v), t: p.t, v: p.v }));

    let iMejor = -1;
    if (o.mejor) {
      const objetivo = o.mejor === "min" ? Math.min(...vs) : Math.max(...vs);
      iMejor = vs.indexOf(objetivo);
    }

    const ejeX = [];
    const etiquetas = Math.min(4, pts.length);
    for (let i = 0; i < etiquetas; i++) {
      const idx = etiquetas === 1 ? 0 : Math.round((i * (pts.length - 1)) / (etiquetas - 1));
      ejeX.push({ x: pts[idx].x, texto: fechaCorta(pts[idx].t) });
    }

    return {
      tipo: "linea",
      ancho,
      alto,
      area: { x: m.izq, y: m.arr, w: areaW, h: areaH },
      ejeY: marcas.map((v) => ({ y: py(v), texto: (o.formatoEje || formato)(v) })),
      ejeX,
      puntos: pts,
      mejor: iMejor,
      ultimo: pts.length - 1,
      formato,
    };
  }

  /** Barras: barras: [{t, v, actual}], línea de meta opcional. */
  function disenoBarras(barras, o) {
    o = o || {};
    const ancho = o.ancho || 340;
    const alto = o.alto || 170;
    const m = MARGEN;
    const areaW = ancho - m.izq - m.der;
    const areaH = alto - m.arr - m.aba;
    const tope = Math.max(o.min || 0, ...barras.map((b) => b.v), o.meta || 0, 3);
    // Marcas enteras que SIEMPRE cubren la barra más alta.
    const paso = tope <= 4 ? 1 : tope <= 8 ? 2 : Math.ceil(tope / 4);
    const y1 = Math.ceil(tope / paso) * paso;
    const marcas = [];
    for (let v = 0; v <= y1; v += paso) marcas.push(v);
    const py = (v) => m.arr + areaH - (v / y1) * areaH;
    const ancho1 = areaW / barras.length;
    const grosor = Math.min(28, ancho1 * 0.62);

    return {
      tipo: "barras",
      ancho,
      alto,
      area: { x: m.izq, y: m.arr, w: areaW, h: areaH },
      ejeY: marcas.map((v) => ({ y: py(v), texto: String(v) })),
      barras: barras.map((b, i) => {
        const x = m.izq + ancho1 * i + (ancho1 - grosor) / 2;
        return { x, y: py(b.v), w: grosor, h: m.arr + areaH - py(b.v), v: b.v, t: b.t, actual: !!b.actual, etiqueta: fechaCorta(b.t), cx: x + grosor / 2 };
      }),
      meta: o.meta ? { y: py(o.meta), valor: o.meta } : null,
    };
  }

  // -----------------------------------------------------
  // SVG
  // -----------------------------------------------------
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const num = (n) => Number(n.toFixed(1));

  function cabecera(d, titulo, descripcion, idBase) {
    return `<svg class="grafico" viewBox="0 0 ${d.ancho} ${d.alto}" role="img" aria-labelledby="${idBase}-t ${idBase}-d" xmlns="http://www.w3.org/2000/svg"><title id="${idBase}-t">${esc(titulo)}</title><desc id="${idBase}-d">${esc(descripcion)}</desc>`;
  }

  function reticula(d) {
    const a = d.area;
    return d.ejeY
      .map(
        (m) =>
          `<line class="grafico__rejilla" x1="${a.x}" x2="${a.x + a.w}" y1="${num(m.y)}" y2="${num(m.y)}"/><text class="grafico__texto" x="${a.x - 6}" y="${num(m.y + 4)}" text-anchor="end">${esc(m.texto)}</text>`
      )
      .join("");
  }

  function svgLinea(d, titulo, descripcion, idBase) {
    const a = d.area;
    const trazo = d.puntos.map((p, i) => `${i ? "L" : "M"}${num(p.x)} ${num(p.y)}`).join(" ");
    const relleno = `${trazo} L${num(d.puntos[d.puntos.length - 1].x)} ${a.y + a.h} L${num(d.puntos[0].x)} ${a.y + a.h} Z`;
    const ejeX = d.ejeX
      .map((m) => `<text class="grafico__texto" x="${num(m.x)}" y="${d.alto - 8}" text-anchor="middle">${esc(m.texto)}</text>`)
      .join("");
    const puntos = d.puntos
      .map((p, i) => `<circle class="grafico__punto${i === d.mejor ? " grafico__punto--mejor" : ""}" cx="${num(p.x)}" cy="${num(p.y)}" r="${i === d.mejor || i === d.ultimo ? 5 : 3.5}"/>`)
      .join("");
    // Etiquetas directas: último valor y mejor valor (sin depender de tocar).
    const u = d.puntos[d.ultimo];
    const anclaU = u.x > d.ancho - 60 ? "end" : "middle";
    let etiquetas = `<text class="grafico__valor" x="${num(u.x)}" y="${num(Math.max(a.y + 10, u.y - 10))}" text-anchor="${anclaU}">${esc(d.formato(u.v))}</text>`;
    if (d.mejor >= 0 && d.mejor !== d.ultimo) {
      const b = d.puntos[d.mejor];
      etiquetas += `<text class="grafico__valor grafico__valor--mejor" x="${num(b.x)}" y="${num(Math.max(a.y + 10, b.y - 10))}" text-anchor="middle">Mejor ${esc(d.formato(b.v))}</text>`;
    }
    return (
      cabecera(d, titulo, descripcion, idBase) +
      reticula(d) +
      `<path class="grafico__area" d="${relleno}"/>` +
      `<path class="grafico__linea" d="${trazo}" fill="none"/>` +
      puntos +
      etiquetas +
      ejeX +
      "</svg>"
    );
  }

  function svgBarras(d, titulo, descripcion, idBase) {
    const a = d.area;
    const barras = d.barras
      .map(
        (b) =>
          `<rect class="grafico__barra${b.actual ? " grafico__barra--actual" : ""}" x="${num(b.x)}" y="${num(b.y)}" width="${num(b.w)}" height="${num(Math.max(b.h, 0))}" rx="4"/>` +
          (b.v > 0 ? `<text class="grafico__valor" x="${num(b.cx)}" y="${num(b.y - 5)}" text-anchor="middle">${b.v}</text>` : "") +
          `<text class="grafico__texto" x="${num(b.cx)}" y="${d.alto - 8}" text-anchor="middle">${esc(b.etiqueta)}</text>`
      )
      .join("");
    const meta = d.meta
      ? `<line class="grafico__meta" x1="${a.x}" x2="${a.x + a.w}" y1="${num(d.meta.y)}" y2="${num(d.meta.y)}"/><text class="grafico__texto grafico__texto--meta" x="${a.x + 4}" y="${num(d.meta.y - 5)}" text-anchor="start">Meta ${d.meta.valor}</text>`
      : "";
    return cabecera(d, titulo, descripcion, idBase) + reticula(d) + barras + meta + "</svg>";
  }

  // -----------------------------------------------------
  // Descripciones para lectores de pantalla
  // -----------------------------------------------------
  const seg = (v) => `${v.toFixed(3)} s`;

  function descripcionLinea(puntos, formato, mejor) {
    const p0 = puntos[0];
    const pn = puntos[puntos.length - 1];
    if (puntos.length === 1) return `Un solo día entrenado, el ${fechaCorta(p0.t)}, con valor ${formato(p0.v)}.`;
    return `${puntos.length} días entrenados. Empezó en ${formato(p0.v)} el ${fechaCorta(p0.t)} y terminó en ${formato(pn.v)} el ${fechaCorta(pn.t)}.${mejor ? ` Mejor valor: ${formato(mejor.v)} el ${fechaCorta(mejor.t)}.` : ""}`;
  }

  /**
   * Todo lo que necesita la pantalla y el informe para un periodo y un modo.
   * Cada gráfico es null si no hay datos suficientes.
   */
  function paquete(historial, o) {
    o = o || {};
    const sesiones = filtrar(historial, o);
    const dias = porDia(sesiones);
    const conTiempo = dias.filter((d) => esNumero(d.promedio) && d.promedio > 0).map((d) => ({ t: d.t, v: d.promedio }));
    const conPrecision = dias.filter((d) => esNumero(d.precision)).map((d) => ({ t: d.t, v: d.precision }));
    const ancho = o.ancho || 340;

    const pkg = {
      comparacion: comparar(historial, o),
      estadisticas: estadisticas(sesiones),
      dias,
      reaccion: null,
      precision: null,
      semanas: null,
    };

    if (conTiempo.length) {
      const d = disenoLinea(conTiempo, { ancho, formato: seg, formatoEje: (v) => v.toFixed(2), mejor: "min" });
      const mejor = d.mejor >= 0 ? conTiempo[d.mejor] : null;
      pkg.reaccion = { diseno: d, puntos: conTiempo, titulo: "Tiempo de reacción por día", descripcion: descripcionLinea(conTiempo, seg, mejor) + " Menos segundos es mejor." };
    }
    if (conPrecision.length) {
      const f = (v) => `${Math.round(v)} %`;
      const d = disenoLinea(conPrecision, { ancho, min: 0, max: 100, formato: f });
      pkg.precision = { diseno: d, puntos: conPrecision, titulo: "Precisión por día", descripcion: descripcionLinea(conPrecision, f, null) + " Más porcentaje es mejor." };
    }
    if ((historial || []).length) {
      const s = semanas(historial, { n: 8, ahora: o.ahora });
      const meta = o.meta || 3;
      const d = disenoBarras(s.map((x) => ({ t: x.t, v: x.dias, actual: x.actual })), { ancho, meta });
      pkg.semanas = { diseno: d, datos: s, meta, titulo: "Días entrenados por semana", descripcion: `Últimas 8 semanas. ${s.map((x) => `semana del ${fechaCorta(x.t)}: ${x.dias} ${x.dias === 1 ? "día" : "días"}`).join("; ")}. Tu meta es ${meta} días.` };
    }
    return pkg;
  }

  function svgDe(grafico, idBase) {
    if (!grafico) return "";
    const d = grafico.diseno;
    return d.tipo === "linea" ? svgLinea(d, grafico.titulo, grafico.descripcion, idBase) : svgBarras(d, grafico.titulo, grafico.descripcion, idBase);
  }

  const API = { filtrar, modosDisponibles, estadisticas, porDia, comparar, semanas, marcasBonitas, disenoLinea, disenoBarras, svgLinea, svgBarras, paquete, svgDe, fechaCorta };
  raiz.RehabGraficos = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
