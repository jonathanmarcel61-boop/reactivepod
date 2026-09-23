// =====================================================
// REHABPOD — INFORME PROFESIONAL EN PDF (construcción)
//
// Convierte el historial de un perfil en un informe de 2+ páginas A4:
// datos del paciente y del periodo, cifras clave, evolución en palabras,
// gráficos vectoriales (los mismos números que la pantalla de Progreso),
// resumen por ejercicio, tabla de sesiones y espacio para observaciones.
//
// Sin DOM: se prueba con Node. Se carga antes de app.js; expone `RehabInforme`.
// =====================================================

(function (raiz) {
  "use strict";

  const PDF = raiz.RehabPDF || (typeof require === "function" ? require("./pdf.js") : null);
  const G = raiz.RehabGraficos || (typeof require === "function" ? require("./graficos.js") : null);

  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const NOMBRE_DIF = { facil: "Fácil", media: "Media", dificil: "Difícil" };

  const C = {
    marca: "#0a0d0c",
    lima: "#c6ff4d",
    limaOscuro: "#4d7c0f",
    limaClaro: "#ecfccb",
    texto: "#111827",
    suave: "#4b5563",
    linea: "#d1d5db",
    fondo: "#f3f4f6",
    verde: "#15803d",
    naranja: "#b45309",
    mejor: "#15803d",
  };

  const MARGEN = 40;
  const ANCHO = PDF ? PDF.A4.ancho - MARGEN * 2 : 515;
  const LIMITE_Y = 790; // por debajo va el pie de página

  const fechaLarga = (t) => {
    const d = new Date(t);
    return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
  };
  const dd = (n) => String(n).padStart(2, "0");
  const fechaHora = (t) => {
    const d = new Date(t);
    return `${dd(d.getDate())}/${dd(d.getMonth() + 1)}/${d.getFullYear()} ${dd(d.getHours())}:${dd(d.getMinutes())}`;
  };
  const seg = (v) => (typeof v === "number" && Number.isFinite(v) ? `${v.toFixed(3)} s` : "—");
  const pct = (v) => (typeof v === "number" && Number.isFinite(v) ? `${Math.round(v)} %` : "—");
  const esc = (s) => String(s == null ? "" : s);

  function slug(texto) {
    return (
      String(texto || "")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 30) || "paciente"
    );
  }

  // -----------------------------------------------------
  // Componentes
  // -----------------------------------------------------
  function cabecera(doc, ahora) {
    doc.rect(0, 0, doc.ancho, 78, { relleno: C.marca });
    doc.rect(0, 0, 8, 78, { relleno: C.lima });
    doc.texto("RehabPod", MARGEN, 38, { tam: 22, negrita: true, color: C.lima });
    doc.texto("Informe de progreso", MARGEN, 60, { tam: 13, color: "#ffffff" });
    doc.texto(`Emitido el ${fechaLarga(ahora)}`, doc.ancho - MARGEN, 60, { tam: 9, color: "#d1d5db", alinear: "der" });
  }

  function dato(doc, etiqueta, valor, x, y, ancho) {
    doc.texto(etiqueta.toUpperCase(), x, y + 8, { tam: 7.5, negrita: true, color: C.suave });
    return doc.parrafo(valor, x, y + 12, ancho, { tam: 11, negrita: true, color: C.texto, interlinea: 13 });
  }

  function tarjetaCifra(doc, x, y, w, etiqueta, valor, nota) {
    doc.rect(x, y, w, 58, { relleno: C.fondo, radio: 6 });
    doc.texto(etiqueta.toUpperCase(), x + 10, y + 16, { tam: 7.5, negrita: true, color: C.suave });
    doc.texto(valor, x + 10, y + 38, { tam: 17, negrita: true, color: C.texto });
    if (nota) doc.texto(nota, x + 10, y + 51, { tam: 8, color: C.suave });
  }

  /** Texto con un fondo blanco detrás para que no se confunda con la línea. */
  function etiqueta(doc, txt, x, y, o) {
    const w = PDF.anchoDe(txt, o.tam, true);
    const x0 = o.alinear === "centro" ? x - w / 2 : x;
    doc.rect(x0 - 2, y - o.tam + 1, w + 4, o.tam + 1.5, { relleno: "#ffffff" });
    doc.texto(txt, x, y, { ...o, negrita: true });
  }

  /** Dibuja un gráfico de línea a partir del diseño de RehabGraficos. */
  function graficoLinea(doc, grafico, x, y, titulo, subtitulo) {
    const d = grafico.diseno;
    doc.texto(titulo, x, y + 10, { tam: 11, negrita: true, color: C.texto });
    doc.texto(subtitulo, x + 2 + PDF.anchoDe(titulo, 11, true), y + 10, { tam: 8.5, color: C.suave });
    const oy = y + 18;
    d.ejeY.forEach((m) => {
      doc.linea(x + d.area.x, oy + m.y, x + d.area.x + d.area.w, oy + m.y, { color: C.linea, grosor: 0.5 });
      doc.texto(m.texto, x + d.area.x - 5, oy + m.y + 3, { tam: 8, color: C.suave, alinear: "der" });
    });
    const pts = d.puntos.map((p) => ({ x: x + p.x, y: oy + p.y }));
    const base = oy + d.area.y + d.area.h;
    if (pts.length > 1) {
      doc.poli([...pts, { x: pts[pts.length - 1].x, y: base }, { x: pts[0].x, y: base }], { relleno: C.limaClaro, cerrar: true });
      doc.poli(pts, { color: C.limaOscuro, grosor: 2 });
    }
    pts.forEach((p, i) => {
      const esMejor = i === d.mejor;
      doc.circulo(p.x, p.y, esMejor ? 3.5 : 2.5, { relleno: esMejor ? C.mejor : "#ffffff", borde: esMejor ? C.mejor : C.limaOscuro, grosor: 1.2 });
    });
    const u = pts[pts.length - 1];
    etiqueta(doc, d.formato(d.puntos[d.ultimo].v), Math.min(u.x, x + d.ancho - 24), u.y - 8, { tam: 8.5, color: C.texto, alinear: "centro" });
    if (d.mejor >= 0 && d.mejor !== d.ultimo) {
      const b = pts[d.mejor];
      etiqueta(doc, `Mejor ${d.formato(d.puntos[d.mejor].v)}`, Math.max(b.x, x + 34), b.y - 8, { tam: 8.5, color: C.mejor, alinear: "centro" });
    }
    d.ejeX.forEach((m) => doc.texto(m.texto, x + m.x, base + 13, { tam: 8, color: C.suave, alinear: "centro" }));
    return oy + d.alto;
  }

  function graficoBarras(doc, grafico, x, y, titulo, subtitulo) {
    const d = grafico.diseno;
    doc.texto(titulo, x, y + 10, { tam: 11, negrita: true, color: C.texto });
    doc.texto(subtitulo, x + 2 + PDF.anchoDe(titulo, 11, true), y + 10, { tam: 8.5, color: C.suave });
    const oy = y + 18;
    d.ejeY.forEach((m) => {
      doc.linea(x + d.area.x, oy + m.y, x + d.area.x + d.area.w, oy + m.y, { color: C.linea, grosor: 0.5 });
      doc.texto(m.texto, x + d.area.x - 5, oy + m.y + 3, { tam: 8, color: C.suave, alinear: "der" });
    });
    d.barras.forEach((b) => {
      if (b.h > 0) doc.rect(x + b.x, oy + b.y, b.w, b.h, { relleno: b.actual ? C.limaOscuro : "#9ca3af", radio: 2 });
      if (b.v > 0) doc.texto(String(b.v), x + b.cx, oy + b.y - 3, { tam: 8.5, negrita: true, color: C.texto, alinear: "centro" });
      doc.texto(b.etiqueta, x + b.cx, oy + d.area.y + d.area.h + 13, { tam: 8, color: C.suave, alinear: "centro" });
    });
    if (d.meta) {
      doc.linea(x + d.area.x, oy + d.meta.y, x + d.area.x + d.area.w, oy + d.meta.y, { color: C.naranja, grosor: 1, guiones: [4, 3] });
      doc.texto(`Meta ${d.meta.valor}`, x + d.area.x + d.area.w, oy + d.meta.y - 3, { tam: 8, color: C.naranja, alinear: "der" });
    }
    return oy + d.alto;
  }

  function pie(doc, ahora) {
    const total = doc.pagina;
    for (let i = 1; i <= total; i++) {
      doc.enPagina(i, () => {
        doc.linea(MARGEN, 806, doc.ancho - MARGEN, 806, { color: C.linea, grosor: 0.5 });
        doc.parrafo(
          `Generado con RehabPod el ${fechaLarga(ahora)}. Los datos provienen de los ejercicios registrados en la aplicación; este informe no constituye un diagnóstico médico.`,
          MARGEN,
          809,
          ANCHO - 70,
          { tam: 7, color: C.suave, interlinea: 9 }
        );
        doc.texto(`Página ${i} de ${total}`, doc.ancho - MARGEN, 818, { tam: 8, color: C.suave, alinear: "der" });
      });
    }
  }

  /**
   * Tabla con encabezado que se repite al saltar de página.
   * columnas: [{ titulo, ancho, alinear }]; filas: arrays de texto.
   */
  function tabla(doc, columnas, filas, y, ahora) {
    const alto = 15;
    const encabezado = (yy) => {
      doc.rect(MARGEN, yy, ANCHO, alto + 2, { relleno: C.fondo });
      let x = MARGEN;
      columnas.forEach((c) => {
        const xt = c.alinear === "der" ? x + c.ancho - 4 : x + 4;
        doc.texto(c.titulo, xt, yy + 11.5, { tam: 8, negrita: true, color: C.texto, alinear: c.alinear === "der" ? "der" : "izq" });
        x += c.ancho;
      });
      return yy + alto + 2;
    };
    let yy = encabezado(y);
    filas.forEach((fila, i) => {
      if (yy + alto > LIMITE_Y) {
        doc.nuevaPagina();
        yy = encabezado(MARGEN);
      }
      if (i % 2 === 1) doc.rect(MARGEN, yy, ANCHO, alto, { relleno: "#fafafa" });
      let x = MARGEN;
      columnas.forEach((c, k) => {
        const xt = c.alinear === "der" ? x + c.ancho - 4 : x + 4;
        let t = esc(fila[k]);
        // Recorta el texto que no cabe en su columna.
        while (t.length > 1 && PDF.anchoDe(t, 8.5, false) > c.ancho - 8) t = t.slice(0, -1);
        doc.texto(t, xt, yy + 10.5, { tam: 8.5, color: C.texto, alinear: c.alinear === "der" ? "der" : "izq" });
        x += c.ancho;
      });
      doc.linea(MARGEN, yy + alto, MARGEN + ANCHO, yy + alto, { color: "#e5e7eb", grosor: 0.4 });
      yy += alto;
    });
    void ahora;
    return yy;
  }

  // -----------------------------------------------------
  // Informe
  // -----------------------------------------------------
  /**
   * @param {object} o
   * @param {{nombre:string, historial:object[]}} o.perfil
   * @param {number|null} o.dias   periodo en días (null = todo)
   * @param {string} [o.modo]      un solo ejercicio
   * @param {number} [o.meta]      meta semanal
   * @param {string} [o.profesional]  nombre del profesional o centro
   * @param {string} [o.observaciones]
   * @param {boolean} [o.incluirTabla=true]
   * @param {Date} [o.ahora]
   * @returns {{bytes:Uint8Array, nombreArchivo:string, paginas:number, resumen:object}}
   */
  function construir(o) {
    const ahora = o.ahora || new Date();
    const perfil = o.perfil || { nombre: "", historial: [] };
    const historial = perfil.historial || [];
    const dias = o.dias || null;
    const modo = o.modo || null;
    const meta = o.meta || 3;
    const incluirTabla = o.incluirTabla !== false;

    const sesiones = G.filtrar(historial, { dias, modo, ahora }).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    const est = G.estadisticas(sesiones);
    const porDia = G.porDia(sesiones);
    const paquete = G.paquete(historial, { dias, modo, meta, ancho: ANCHO, ahora });

    const doc = new PDF.Documento({ titulo: `Informe RehabPod - ${perfil.nombre || "Paciente"}`, autor: o.profesional || "RehabPod" });

    // ---- Página 1
    cabecera(doc, ahora);

    let y = 98;
    const primera = sesiones.length ? new Date(Math.min(...sesiones.map((s) => s.timestamp || Date.now()))) : null;
    const periodo = dias
      ? `Últimos ${dias} días (${fechaLarga(new Date(new Date(ahora).setDate(ahora.getDate() - dias + 1)))} al ${fechaLarga(ahora)})`
      : primera
        ? `Todo el historial (${fechaLarga(primera)} al ${fechaLarga(ahora)})`
        : "Todo el historial";
    const yA = dato(doc, "Paciente", perfil.nombre || "Sin nombre", MARGEN, y, 240);
    const yB = dato(doc, "Periodo", periodo, MARGEN + 250, y, ANCHO - 250);
    y = Math.max(yA, yB) + 4;
    const yC = dato(doc, "Ejercicio", modo || "Todos los ejercicios", MARGEN, y, 240);
    const yD = dato(doc, "Profesional o centro", o.profesional ? o.profesional : "—", MARGEN + 250, y, ANCHO - 250);
    y = Math.max(yC, yD) + 10;

    const w = (ANCHO - 30) / 4;
    tarjetaCifra(doc, MARGEN, y, w, "Sesiones", String(est.sesiones), `${porDia.length} ${porDia.length === 1 ? "día" : "días"} de entrenamiento`);
    tarjetaCifra(doc, MARGEN + (w + 10), y, w, "Precisión", pct(est.precision), `${est.aciertos} aciertos · ${est.errores} errores`);
    tarjetaCifra(doc, MARGEN + (w + 10) * 2, y, w, "Reacción promedio", seg(est.promedio), "menos es mejor");
    tarjetaCifra(doc, MARGEN + (w + 10) * 3, y, w, "Mejor reacción", seg(est.mejor), "mejor marca del periodo");
    y += 70;

    // Evolución en palabras.
    const cmp = paquete.comparacion;
    const colorTend = cmp.tendencia === "mejora" ? C.verde : cmp.tendencia === "baja" ? C.naranja : C.suave;
    const altoFrase = doc.alturaParrafo(cmp.mensaje, ANCHO - 20, { tam: 10.5 });
    doc.rect(MARGEN, y, 4, altoFrase + 12, { relleno: colorTend });
    doc.parrafo(cmp.mensaje, MARGEN + 14, y + 4, ANCHO - 20, { tam: 10.5, color: C.texto });
    y += altoFrase + 24;

    if (paquete.reaccion) y = graficoLinea(doc, paquete.reaccion, MARGEN, y, "Tiempo de reacción", "promedio por día · menos segundos es mejor") + 14;
    else {
      doc.texto("Todavía no hay datos de tiempo de reacción en este periodo.", MARGEN, y + 12, { tam: 10, color: C.suave });
      y += 30;
    }
    if (paquete.precision) y = graficoLinea(doc, paquete.precision, MARGEN, y, "Precisión", "por día · más porcentaje es mejor") + 6;

    // ---- Página 2
    doc.nuevaPagina();
    y = MARGEN;
    if (paquete.semanas) y = graficoBarras(doc, paquete.semanas, MARGEN, y, "Constancia", "días entrenados por semana (últimas 8 semanas)") + 14;

    // Resumen por ejercicio.
    const porModo = G.modosDisponibles(sesiones).map((m) => ({ modo: m, e: G.estadisticas(sesiones.filter((s) => s.modo === m)) }));
    if (porModo.length) {
      doc.texto("Resumen por ejercicio", MARGEN, y + 10, { tam: 11, negrita: true, color: C.texto });
      y = tabla(
        doc,
        [
          { titulo: "Ejercicio", ancho: 195 },
          { titulo: "Sesiones", ancho: 60, alinear: "der" },
          { titulo: "Aciertos", ancho: 60, alinear: "der" },
          { titulo: "Errores", ancho: 60, alinear: "der" },
          { titulo: "Precisión", ancho: 60, alinear: "der" },
          { titulo: "Promedio", ancho: 80, alinear: "der" },
        ].map((c, i, a) => (i === a.length - 1 ? { ...c, ancho: ANCHO - a.slice(0, -1).reduce((s, x) => s + x.ancho, 0) } : c)),
        porModo.map(({ modo: m, e }) => [m, String(e.sesiones), String(e.aciertos), String(e.errores), pct(e.precision), seg(e.promedio)]),
        y + 16,
        ahora
      ) + 16;
    }

    // Sesiones registradas.
    if (incluirTabla && sesiones.length) {
      const MAX = 200;
      if (y > LIMITE_Y - 80) {
        doc.nuevaPagina();
        y = MARGEN;
      }
      doc.texto("Sesiones registradas", MARGEN, y + 10, { tam: 11, negrita: true, color: C.texto });
      if (sesiones.length > MAX) doc.texto(`Se muestran las ${MAX} más recientes de ${sesiones.length}.`, MARGEN + 130, y + 10, { tam: 8.5, color: C.suave });
      const cols = [
        { titulo: "Fecha", ancho: 92 },
        { titulo: "Ejercicio", ancho: 140 },
        { titulo: "Dificultad", ancho: 60 },
        { titulo: "Aciertos", ancho: 52, alinear: "der" },
        { titulo: "Errores", ancho: 48, alinear: "der" },
        { titulo: "Precis.", ancho: 48, alinear: "der" },
        { titulo: "Promedio", ancho: 0, alinear: "der" },
      ];
      cols[6].ancho = ANCHO - cols.slice(0, 6).reduce((s, c) => s + c.ancho, 0);
      y = tabla(
        doc,
        cols,
        sesiones.slice(0, MAX).map((s) => {
          const total = Number(s.aciertos || 0) + Number(s.errores || 0);
          return [s.timestamp ? fechaHora(s.timestamp) : esc(s.fecha), esc(s.modo), NOMBRE_DIF[s.dificultad] || "—", String(s.aciertos ?? 0), String(s.errores ?? 0), total ? pct((Number(s.aciertos || 0) / total) * 100) : "—", seg(s.promedio)];
        }),
        y + 16,
        ahora
      ) + 18;
    }

    // Observaciones.
    const obs = String(o.observaciones || "").trim();
    const alturaObs = Math.max(70, obs ? doc.alturaParrafo(obs, ANCHO - 20, { tam: 10 }) + 24 : 70);
    if (y + alturaObs + 22 > LIMITE_Y) {
      doc.nuevaPagina();
      y = MARGEN;
    }
    doc.texto("Observaciones del profesional", MARGEN, y + 10, { tam: 11, negrita: true, color: C.texto });
    y += 16;
    doc.rect(MARGEN, y, ANCHO, alturaObs, { borde: C.linea, grosor: 0.8, radio: 4 });
    if (obs) doc.parrafo(obs, MARGEN + 10, y + 8, ANCHO - 20, { tam: 10, color: C.texto });
    else {
      for (let k = 1; k <= 3; k++) doc.linea(MARGEN + 10, y + 18 * k, MARGEN + ANCHO - 10, y + 18 * k, { color: "#e5e7eb", grosor: 0.6 });
    }
    y += alturaObs + 10;
    if (o.profesional) doc.texto(`Profesional o centro: ${o.profesional}`, MARGEN, y + 8, { tam: 8.5, color: C.suave });

    pie(doc, ahora);

    const d = ahora;
    return {
      bytes: doc.salida(),
      nombreArchivo: `Informe-RehabPod-${slug(perfil.nombre)}-${d.getFullYear()}-${dd(d.getMonth() + 1)}-${dd(d.getDate())}.pdf`,
      paginas: doc.pagina,
      resumen: { sesiones: est.sesiones, dias: porDia.length, precision: est.precision, promedio: est.promedio, mejor: est.mejor, tendencia: cmp.tendencia },
    };
  }

  const API = { construir, slug, fechaLarga };
  raiz.RehabInforme = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
